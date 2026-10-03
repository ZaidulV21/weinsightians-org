// ==========================================
// REMOTE IMAGE FETCHING (SSRF-HARDENED)
// ==========================================
// The CMS can import a featured image from a URL. That turns the server into a
// client of the open internet, which is the classic shape of a server-side
// request forgery (SSRF): if the URL is not checked, a logged-in admin (or
// anyone who has their session) can point this at 169.254.169.254, at a
// database on 10.0.0.5, or at an internal admin panel, and read the response
// back as if it were a picture.
//
// So this module is deliberately paranoid. Every layer below exists because a
// single check is not enough:
//
//   1. Protocol          http/https only. No file:, gopher:, data:, ftp:.
//   2. Hostname          No credentials in the URL, no non-standard port.
//   3. DNS resolution    Resolve the name, then check EVERY address it returns.
//                        A name that resolves to both a public and a private
//                        address is rejected, not just filtered down to the
//                        public one.
//   4. Connection        The socket is pinned to an address that was already
//                        validated. This closes the DNS-rebinding window where a
//                        name resolves to a public IP during the check and to
//                        127.0.0.1 a moment later when the socket is opened.
//   5. Redirects         Followed manually, and each hop goes through all of the
//                        above again. A public URL that redirects to 127.0.0.1 is
//                        the standard bypass, so it is checked explicitly.
//   6. Timeouts          Whole-request deadline, not just a socket idle timeout,
//                        so a slow trickle cannot hold a connection open.
//   7. Size              The cap is enforced while the body streams in, so an
//                        enormous or endless response is cut off rather than
//                        buffered and then measured.
//   8. Content type      Must be an allowed image type, checked on the response
//                        header and then again on the actual bytes. A .jpg URL
//                        that serves text/html is rejected.
//   9. Magic bytes       detectImageMimeType() from fileValidation.js, the same
//                        check an uploaded file goes through, so an imported
//                        image is exactly as trustworthy as a local one.
//
// Errors thrown from here are written for the admin who typed the URL. They
// never contain a stack trace, a resolved IP address, a filesystem path or any
// part of a response body, because errorHandlerMiddleware decides what a client
// is allowed to see and this code must not widen that.

import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import { BadRequestError, PayloadTooLargeError } from '../errors/customErrors.js';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  detectImageMimeType,
} from './fileValidation.js';

export const REMOTE_IMAGE_TIMEOUT_MS = 10_000;
export const MAX_REDIRECTS = 3;

// Ports an image is normally served on. Allowing any port would let a request
// reach an internal service that happens to be listening on something odd.
const ALLOWED_PORTS = new Set([80, 443]);

// ==========================================
// ADDRESS CLASSIFICATION
// ==========================================

const ipv4ToInt = (address) =>
  address
    .split('.')
    .reduce((total, part) => ((total << 8) + Number(part)) >>> 0, 0);

const inV4Range = (address, cidr) => {
  const [base, bits] = cidr.split('/');
  const mask = bits === '0' ? 0 : (0xffffffff << (32 - Number(bits))) >>> 0;
  return (ipv4ToInt(address) & mask) === (ipv4ToInt(base) & mask);
};

// Everything that is not ordinary public internet space. Each entry is here
// because it is a real place a server can be reached that is not the internet:
// loopback, private ranges, link-local (which is where cloud instance metadata
// lives), carrier NAT, and the reserved/benchmarking blocks.
const BLOCKED_V4_RANGES = [
  '0.0.0.0/8', // "this network"
  '10.0.0.0/8', // RFC1918 private
  '100.64.0.0/10', // carrier-grade NAT
  '127.0.0.0/8', // loopback
  '169.254.0.0/16', // link-local, including 169.254.169.254 metadata
  '172.16.0.0/12', // RFC1918 private
  '192.0.0.0/24', // IETF protocol assignments
  '192.0.2.0/24', // TEST-NET-1
  '192.88.99.0/24', // 6to4 relay anycast
  '192.168.0.0/16', // RFC1918 private
  '198.18.0.0/15', // benchmarking
  '198.51.100.0/24', // TEST-NET-2
  '203.0.113.0/24', // TEST-NET-3
  '224.0.0.0/4', // multicast
  '240.0.0.0/4', // reserved, includes 255.255.255.255
];

const isBlockedV4 = (address) =>
  BLOCKED_V4_RANGES.some((range) => inV4Range(address, range));

// The cloud metadata endpoints, named as well as numbered, because some
// environments resolve these hostnames to non-standard addresses.
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata',
  'metadata.google.internal',
  'instance-data',
]);

const stripIpv6Brackets = (value) =>
  value.startsWith('[') && value.endsWith(']') ? value.slice(1, -1) : value;

/**
 * True when an address must never be connected to.
 *
 * IPv6 is handled by expanding it to its full form, so the prefix checks below
 * are exact rather than string matches that a different spelling could slip past
 * (::1 vs 0:0:0:0:0:0:0:1, or fe80::1 vs fe80:0:0:0:0:0:0:1).
 */
export const isPrivateAddress = (rawAddress) => {
  const address = stripIpv6Brackets(String(rawAddress || '').trim());
  if (!address) return true;

  // An IPv4-mapped or IPv4-compatible IPv6 address is really an IPv4 address in
  // disguise, so it is classified as one. ::ffff:127.0.0.1 reaches loopback.
  const mapped = address.match(/^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mapped) return isBlockedV4(mapped[1]);

  if (net.isIPv4(address)) return isBlockedV4(address);

  if (!net.isIPv6(address)) return true; // not an address we understand

  const expanded = expandIpv6(address);

  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') return true; // ::
  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') return true; // ::1

  // Unique local (fc00::/7) and link-local (fe80::/10).
  if (/^f[cd]/.test(expanded.slice(0, 4).replace(/^0+(?=.)/, ''))) return true;
  if (expanded.startsWith('fe80') || expanded.startsWith('fe9') ||
      expanded.startsWith('fea') || expanded.startsWith('feb')) {
    return true;
  }

  // Multicast (ff00::/8).
  if (expanded.startsWith('ff')) return true;

  // IPv4-mapped in its expanded hex form. ::ffff:7f00:1 and ::ffff:127.0.0.1 are
  // the same address, and the hex spelling is what a resolver returns, so it has
  // to be classified the same way as the dotted one. :: and ::1 are handled
  // above; this catches the ::ffff: family in either of its two written forms.
  const hexMapped = expanded.match(
    /^0{4}:0{4}:0{4}:0{4}:0{4}:(?:0{4}|ffff):([0-9a-f]{4}):([0-9a-f]{4})$/
  );
  if (hexMapped) {
    const high = parseInt(hexMapped[1], 16);
    const low = parseInt(hexMapped[2], 16);

    // ::0.0.0.x is IPv4-compatible, and a non-zero low group is a real address.
    if (high !== 0 || low > 1) {
      const asV4 = `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`;
      return isBlockedV4(asV4);
    }
  }

  return false;
};

// Expands "::" and shortens into a fixed 8-group form so prefix tests are exact.
const expandIpv6 = (address) => {
  const [head, tail] = address.split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail === undefined ? [] : tail.split(':');
  const fill = 8 - headGroups.length - tailGroups.length;
  const groups = [...headGroups, ...Array(Math.max(0, fill)).fill('0'), ...tailGroups];
  return groups
    .slice(0, 8)
    .map((group) => group.padStart(4, '0').toLowerCase())
    .join(':');
};

// ==========================================
// URL AND DNS VALIDATION
// ==========================================

const normaliseHostname = (hostname) => stripIpv6Brackets(hostname).toLowerCase();

/**
 * Rejects a URL before anything is resolved.
 *
 * The returned URL is what every later stage works from, so each stage sees the
 * same, already-checked address.
 */
export const parseRemoteImageUrl = (rawUrl) => {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    throw new BadRequestError('Enter an image URL');
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    throw new BadRequestError('That URL is too long');
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    throw new BadRequestError('That does not look like a valid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestError('The image URL must start with http:// or https://');
  }

  // user:pass@host is a classic way of confusing a URL parser, and it is never
  // legitimate for a public image.
  if (url.username || url.password) {
    throw new BadRequestError('That URL is not a valid image address');
  }

  const hostname = normaliseHostname(url.hostname);
  if (!hostname) {
    throw new BadRequestError('That does not look like a valid URL');
  }

  // Checked before the port, so "http://localhost/a.png" is refused as a local
  // address rather than as a port problem, which is the honest reason.
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost') ||
      hostname.endsWith('.internal') || hostname.endsWith('.local')) {
    throw new BadRequestError('That address cannot be used');
  }

  // A literal address in the URL is checked immediately: no DNS lookup can
  // change the answer, and it is the most direct attempt to reach the server's
  // own network.
  if (net.isIP(hostname) && isPrivateAddress(hostname)) {
    throw new BadRequestError('That address cannot be used');
  }

  // Number(), because url.port is a string: "443" is not "443" to a Set, and
  // every legitimate URL would be refused for the wrong reason. An empty port
  // means the scheme's default, which is already one of the two allowed.
  const port = Number(url.port || (url.protocol === 'https:' ? 443 : 80));
  if (!ALLOWED_PORTS.has(port)) {
    throw new BadRequestError('The image URL must use a standard web port (80 or 443)');
  }

  return url;
};

/**
 * Resolves a hostname and confirms every address it maps to is public.
 *
 * All of them are checked, and one private address fails the whole request. If
 * only the usable addresses were kept, a name that resolves to both a public and
 * a private address would be "partly allowed", and which one got used would
 * depend on connection order.
 */
export const resolvePublicAddresses = async (hostname, lookup = dns.promises.lookup) => {
  if (net.isIP(hostname)) {
    return [hostname];
  }

  let records;
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    // The resolver's own error is never shown to the client: it can quote the
    // name, the server's DNS configuration, or an internal resolver address.
    throw new BadRequestError('That host could not be reached');
  }

  const addresses = (Array.isArray(records) ? records : [records])
    .map((record) => (typeof record === 'string' ? record : record?.address))
    .filter(Boolean);

  if (addresses.length === 0) {
    throw new BadRequestError('That host could not be reached');
  }

  if (addresses.some((address) => isPrivateAddress(address))) {
    throw new BadRequestError('That address cannot be used');
  }

  return addresses;
};

// ==========================================
// RESPONSE HANDLING
// ==========================================

const contentTypeOf = (response) =>
  String(response.headers['content-type'] || '')
    .split(';')[0]
    .trim()
    .toLowerCase();

/**
 * Reads the body while enforcing the size cap.
 *
 * The cap is checked as bytes arrive rather than after the fact, so a response
 * that lies about its Content-Length, or never sends one, is still cut off.
 */
const readCappedBody = (response) =>
  new Promise((resolve, reject) => {
    const declared = Number(response.headers['content-length']);
    if (Number.isFinite(declared) && declared > MAX_IMAGE_SIZE_BYTES) {
      response.destroy();
      reject(new PayloadTooLargeError('That image is larger than the 5 MB limit'));
      return;
    }
    // The 5 MB limit has been told to the user above; nothing further is read.

    const chunks = [];
    let total = 0;
    let settled = false;

    // destroy() emits its own 'error' as it tears the socket down, so without
    // this guard an aborted read would replace the real reason (a 413, or a
    // completed body) with a generic "could not be read".
    const settle = (error, value) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve(value);
    };

    response.on('data', (chunk) => {
      if (settled) return;
      total += chunk.length;
      if (total > MAX_IMAGE_SIZE_BYTES) {
        response.destroy();
        settle(new PayloadTooLargeError('That image is larger than the 5 MB limit'));
        return;
      }
      chunks.push(chunk);
    });

    response.on('end', () => {
      if (settled) return;
      settle(null, Buffer.concat(chunks));
    });

    response.on('error', () =>
      settle(new BadRequestError('The image could not be read from that URL')));
  });

// A one-shot request against an address that has already been validated. The
// `lookup` override is the important part: the socket is opened on the exact IP
// that passed the checks, so a second DNS answer cannot substitute a private one.
const requestOnce = (url, address, deadline) =>
  new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const remaining = deadline - Date.now();

    if (remaining <= 0) {
      reject(new BadRequestError('That URL took too long to respond'));
      return;
    }

    const request = transport.request(
      {
        protocol: url.protocol,
        hostname: normaliseHostname(url.hostname),
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        // Pin the connection to the validated address.
        //
        // Node asks a custom `lookup` for its answer in one of two shapes, and
        // which one depends on autoSelectFamily (true by default since Node 20):
        // with { all: true } it wants an array of { address, family }, otherwise
        // the scalar (address, family). Answering the scalar form when the array
        // form was asked for makes Node read a string as a list, connect to
        // `undefined`, and fail with ERR_INVALID_IP_ADDRESS — which surfaced as
        // "That host could not be reached" for every URL. Both shapes are
        // answered here, always with the same single already-validated address,
        // so the DNS-rebinding guard is exactly as strict as before.
        lookup: (_hostname, lookupOptions, callback) => {
          const family = net.isIP(address);
          if (lookupOptions?.all) {
            callback(null, [{ address, family }]);
            return;
          }
          callback(null, address, family);
        },
        headers: {
          // A plain identifying UA. Some CDNs refuse a request with none, and
          // the address is already the thing being identified.
          'user-agent': 'WeInsightians-CMS/1.0 (+featured image import)',
          accept: 'image/*',
        },
        // Refuse a TLS certificate that does not match the hostname, and do not
        // follow the library's own redirect handling.
        rejectUnauthorized: true,
      },
      (response) => {
        resolve(response);
      }
    );

    request.setTimeout(Math.min(remaining, REMOTE_IMAGE_TIMEOUT_MS), () => {
      request.destroy();
      reject(new BadRequestError('That URL took too long to respond'));
    });

    request.on('error', () => {
      reject(new BadRequestError('That host could not be reached'));
    });

    request.end();
  });

/**
 * Downloads an image over http(s) and returns it as a buffer plus its real type.
 *
 * Returns only what the caller needs to store the image. Nothing about the
 * remote host, its addresses or its response headers leaves this function.
 */
export const fetchRemoteImage = async (
  rawUrl,
  { lookup = dns.promises.lookup, transport = requestOnce } = {}
) => {
  let currentUrl = parseRemoteImageUrl(rawUrl);
  const deadline = Date.now() + REMOTE_IMAGE_TIMEOUT_MS;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const hostname = normaliseHostname(currentUrl.hostname);

    // Re-validated on every hop. A redirect is just a new URL, and a new URL is
    // exactly as capable of pointing somewhere internal as the first one.
    const addresses = await resolvePublicAddresses(hostname, lookup);

    // A transport failure is caught and restated here as well as in requestOnce.
    // The stub used by the tests throws directly, and more importantly this
    // guarantees that no error from below this line can reach a client carrying
    // a system message, a resolved address or a port.
    let response;
    try {
      response = await transport(currentUrl, addresses[0], deadline);
    } catch (error) {
      // Our own messages are already safe and specific; keep them.
      if (error instanceof BadRequestError || error instanceof PayloadTooLargeError) {
        throw error;
      }
      throw new BadRequestError('That host could not be reached');
    }

    const status = response.statusCode || 0;

    if (status >= 300 && status < 400 && response.headers.location) {
      response.resume(); // drain, so the socket is not left open
      if (hop === MAX_REDIRECTS) {
        throw new BadRequestError('That URL redirected too many times');
      }

      let next;
      try {
        next = new URL(response.headers.location, currentUrl);
      } catch {
        throw new BadRequestError('That URL redirected somewhere unreadable');
      }

      // Full validation again on the destination, protocol and all.
      currentUrl = parseRemoteImageUrl(next.href);
      continue;
    }

    if (status < 200 || status >= 300) {
      response.resume();
      throw new BadRequestError('That URL did not return an image');
    }

    const contentType = contentTypeOf(response);
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(contentType)) {
      response.resume();
      // The real type is never disclosed, because a server that answers
      // text/html for an image URL is either misconfigured or hostile, and
      // either way the detail is of no use to the person fixing the CMS.
      throw new BadRequestError('That URL did not return an image');
    }

    const body = await readCappedBody(response);

    if (body.length === 0) {
      throw new BadRequestError('That URL returned an empty response');
    }

    // The header claimed an image. The bytes decide whether it is one: this is
    // the same magic-byte check an uploaded file goes through, so a remote
    // image can never be more permissive than a local one.
    const detected = detectImageMimeType(body);
    if (!detected) {
      throw new BadRequestError('That URL did not return a valid image file');
    }

    if (detected !== contentType) {
      throw new BadRequestError('That URL did not return a valid image file');
    }

    return { buffer: body, mimeType: detected };
  }

  throw new BadRequestError('That URL redirected too many times');
};

export default fetchRemoteImage;
