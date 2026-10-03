import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import https from 'node:https';
import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';
import User from '../models/User.js';
import { createJWT } from '../utils/tokenUtils.js';
import {
  isPrivateAddress,
  parseRemoteImageUrl,
  resolvePublicAddresses,
  fetchRemoteImage,
} from '../utils/remoteImageFetcher.js';
import { MAX_IMAGE_SIZE_BYTES } from '../utils/fileValidation.js';

// The import endpoint makes the server fetch a URL of the caller's choosing, so
// these tests are mostly about what it must refuse. Every one of them uses a
// stub DNS resolver and a stub transport, so nothing here reaches the network
// and no internal address is ever contacted.

const ADMIN_ID = new mongoose.Types.ObjectId();
const ADMIN_TOKEN = createJWT({ userId: String(ADMIN_ID), role: 'admin', tokenVersion: 0 });

const IMPORT_PATH = '/api/v1/blogs/admin/import-image';

// A real PNG signature, because the magic-byte check runs on the fetched bytes.
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]),
  Buffer.alloc(32, 0x11),
]);

// A resolver that answers with whatever addresses a test asks for.
const resolverReturning = (...addresses) => async () =>
  addresses.map((address) => ({ address, family: address.includes(':') ? 6 : 4 }));

const publicResolver = resolverReturning('93.184.216.34');

// A response object shaped like the ones http.request emits. resume() must be
// the stream's own: Readable calls it internally when a 'data' listener is
// attached, so replacing it would leave the stream paused forever.
const fakeResponse = ({ status = 200, headers = {}, body = Buffer.alloc(0) }) => {
  const stream = new PassThrough();
  process.nextTick(() => {
    if (body.length) stream.write(body);
    stream.end();
  });

  return Object.assign(stream, { statusCode: status, headers });
};

// Stubs only the account lookup, so the real cookie, token, role and rate-limit
// chain still runs. Same pattern as uploadRoute.test.js.
const withAdminSession = async (run) => {
  const original = User.findById;
  User.findById = () => {
    const query = {
      select: () => query,
      lean: async () => ({ _id: ADMIN_ID, role: 'admin', tokenVersion: 0 }),
    };
    return query;
  };

  try {
    return await run();
  } finally {
    User.findById = original;
  }
};

const importWith = (url) =>
  withAdminSession(() =>
    request(app)
      .post(IMPORT_PATH)
      .set('Cookie', [`token=${ADMIN_TOKEN}`])
      .send({ url }));

// ==========================================
// ADDRESS CLASSIFICATION
// ==========================================

test('private and reserved addresses are never considered public', () => {
  const blocked = [
    '127.0.0.1', '127.1.2.3', '0.0.0.0', '10.0.0.5', '172.16.0.1', '172.31.255.255',
    '192.168.1.1', '169.254.169.254', '100.64.0.1', '198.18.0.1', '203.0.113.1',
    '192.0.2.1', '224.0.0.1', '240.0.0.1', '255.255.255.255',
    '::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'febf::1', 'ff02::1',
    // IPv4-mapped IPv6, in both the dotted and the expanded hex spelling. These
    // reach loopback and link-local just as the plain forms do.
    '::ffff:127.0.0.1', '::ffff:10.0.0.1', '::ffff:169.254.169.254',
    '0000:0000:0000:0000:0000:ffff:7f00:0001',
    '0000:0000:0000:0000:0000:ffff:a9fe:a9fe',
    '[::1]',
  ];

  blocked.forEach((address) => {
    assert.equal(isPrivateAddress(address), true, `${address} must be blocked`);
  });
});

test('ordinary public addresses are not mistaken for private ones', () => {
  const allowed = [
    '8.8.8.8', '1.1.1.1', '93.184.216.34', '11.0.0.1',
    // Just outside each private range, which is where an off-by-one hides.
    '172.15.255.255', '172.32.0.1', '192.167.255.255', '192.169.0.1', '100.63.255.255',
    '2606:4700:4700::1111', '2001:4860:4860::8888',
    '0000:0000:0000:0000:0000:ffff:0808:0808',
  ];

  allowed.forEach((address) => {
    assert.equal(isPrivateAddress(address), false, `${address} must be allowed`);
  });
});

// ==========================================
// URL REJECTION
// ==========================================

test('only http and https URLs are accepted', () => {
  const refused = [
    'file:///etc/passwd',
    'gopher://example.com/1',
    'ftp://example.com/a.png',
    'data:image/png;base64,iVBORw0KGgo=',
    'javascript:alert(1)',
  ];

  refused.forEach((url) => {
    assert.throws(
      () => parseRemoteImageUrl(url),
      /http:\/\/ or https:\/\//,
      `${url} must be refused`
    );
  });
});

test('localhost, metadata names and internal suffixes are refused', () => {
  const refused = [
    'http://localhost/a.png',
    'http://api.localhost/a.png',
    'https://metadata.google.internal/computeMetadata/v1/',
    'http://box.internal/a.png',
    'http://printer.local/a.png',
  ];

  refused.forEach((url) => {
    assert.throws(() => parseRemoteImageUrl(url), /cannot be used/, `${url} must be refused`);
  });
});

test('a private address written straight into the URL is refused before any lookup', () => {
  const refused = [
    'http://127.0.0.1/a.png',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.1.2.3/a.png',
    'http://192.168.0.1/a.png',
    'http://[::1]/a.png',
    'http://[fd00::1]/a.png',
    'http://0.0.0.0/a.png',
  ];

  refused.forEach((url) => {
    assert.throws(() => parseRemoteImageUrl(url), /cannot be used/, `${url} must be refused`);
  });
});

test('credentials in the URL and unusual ports are refused', () => {
  assert.throws(
    () => parseRemoteImageUrl('http://user:pass@example.com/a.png'),
    /not a valid image address/
  );
  assert.throws(
    () => parseRemoteImageUrl('http://example.com:22/a.png'),
    /standard web port/
  );
  assert.throws(
    () => parseRemoteImageUrl('https://example.com:8443/a.png'),
    /standard web port/
  );
});

test('ordinary image URLs are accepted', () => {
  const accepted = [
    'https://example.com/a.png',
    'http://example.com/a.jpg',
    'https://cdn.example.com:443/img.webp',
    'https://EXAMPLE.com/Path/Img.PNG?width=800',
  ];

  accepted.forEach((url) => {
    assert.doesNotThrow(() => parseRemoteImageUrl(url), `${url} must be accepted`);
  });
});

// ==========================================
// DNS RESOLUTION
// ==========================================

test('a name that resolves to any private address fails the whole request', async () => {
  // Mixed results must not be filtered down to the public address: which one
  // was used would then depend on connection order.
  await assert.rejects(
    () => resolvePublicAddresses('sneaky.example.com', resolverReturning('93.184.216.34', '127.0.0.1')),
    /cannot be used/
  );
});

test('a resolver failure is reported without leaking the resolver error', async () => {
  await assert.rejects(
    () => resolvePublicAddresses('nope.example.com', async () => {
      throw new Error('getaddrinfo ENOTFOUND nope.example.com at 10.0.0.53');
    }),
    (error) => {
      assert.match(error.message, /could not be reached/);
      assert.doesNotMatch(error.message, /ENOTFOUND|10\.0\.0\.53/);
      return true;
    }
  );
});

// ==========================================
// FETCHING
// ==========================================

test('a public image URL is downloaded and identified by its real bytes', async () => {
  const result = await fetchRemoteImage('https://example.com/cover.png', {
    lookup: publicResolver,
    transport: async () => fakeResponse({
      status: 200,
      headers: { 'content-type': 'image/png' },
      body: png,
    }),
  });

  assert.equal(result.mimeType, 'image/png');
  assert.deepEqual(result.buffer, png);
});

test('the socket is opened on the address that was validated', async () => {
  // The DNS-rebinding guard: fetchRemoteImage must hand the transport an address
  // it has already checked, not a hostname to resolve again.
  let usedAddress = null;

  await fetchRemoteImage('https://example.com/cover.png', {
    lookup: publicResolver,
    transport: async (_url, address) => {
      usedAddress = address;
      return fakeResponse({ headers: { 'content-type': 'image/png' }, body: png });
    },
  });

  assert.equal(usedAddress, '93.184.216.34');
});

test('a redirect to a private address is refused', async () => {
  // The standard bypass: a public URL that hands off to 127.0.0.1. The redirect
  // destination goes through the same checks as the original URL.
  const hops = [];

  await assert.rejects(
    () => fetchRemoteImage('https://example.com/cover.png', {
      lookup: async (hostname) => {
        hops.push(hostname);
        return hostname === 'example.com'
          ? [{ address: '93.184.216.34', family: 4 }]
          : [{ address: '127.0.0.1', family: 4 }];
      },
      transport: async (url) => {
        if (url.hostname === 'example.com') {
          return fakeResponse({
            status: 302,
            headers: { location: 'http://internal.example.com/secret' },
          });
        }
        return fakeResponse({ headers: { 'content-type': 'image/png' }, body: png });
      },
    }),
    /cannot be used/
  );

  // Proof the second hop was actually attempted, i.e. the redirect was followed
  // and its destination checked rather than ignored.
  assert.deepEqual(hops, ['example.com', 'internal.example.com']);
});

test('a redirect to a non-http scheme is refused', async () => {
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/cover.png', {
      lookup: publicResolver,
      transport: async () => fakeResponse({ status: 301, headers: { location: 'file:///etc/passwd' } }),
    }),
    /http:\/\/ or https:\/\//
  );
});

test('a redirect loop is stopped', async () => {
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/a.png', {
      lookup: publicResolver,
      transport: async () => fakeResponse({
        status: 302,
        headers: { location: 'https://example.com/b.png' },
      }),
    }),
    /redirected too many times/
  );
});

test('a redirect that ends at a real image is followed', async () => {
  const result = await fetchRemoteImage('https://example.com/cover.png', {
    lookup: publicResolver,
    transport: async (url) =>
      url.pathname === '/moved.png'
        ? fakeResponse({ status: 200, headers: { 'content-type': 'image/png' }, body: png })
        : fakeResponse({ status: 302, headers: { location: '/moved.png' } }),
  });

  assert.equal(result.mimeType, 'image/png');
});

test('a non-image response is refused even when the URL looks like a picture', async () => {
  // The extension and the request said image. The response says otherwise.
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/cover.png', {
      lookup: publicResolver,
      transport: async () => fakeResponse({
        status: 200,
        headers: { 'content-type': 'text/html' },
        body: Buffer.from('<html><body>hello</body></html>'),
      }),
    }),
    /did not return an image/
  );
});

test('an image content type with non-image bytes is refused', async () => {
  // The header is checked, and then the bytes. A server that claims image/png
  // and returns HTML is not trusted.
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/cover.png', {
      lookup: publicResolver,
      transport: async () => fakeResponse({
        status: 200,
        headers: { 'content-type': 'image/png' },
        body: Buffer.from('<!doctype html><script>alert(1)</script>'),
      }),
    }),
    /did not return a valid image file/
  );
});

test('an SVG served as an image is refused by the magic-byte check', async () => {
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/cover.svg', {
      lookup: publicResolver,
      transport: async () => fakeResponse({
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
        body: Buffer.from('<svg><script>alert(1)</script></svg>'),
      }),
    }),
    /did not return an image/
  );
});

test('a content type that disagrees with the real bytes is refused', async () => {
  // Declared JPEG, actually a PNG. The same rule an uploaded file goes through.
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/cover.jpg', {
      lookup: publicResolver,
      transport: async () => fakeResponse({
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
        body: png,
      }),
    }),
    /did not return a valid image file/
  );
});

test('an oversized response is refused by its declared length', async () => {
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/huge.png', {
      lookup: publicResolver,
      transport: async () => fakeResponse({
        status: 200,
        headers: {
          'content-type': 'image/png',
          'content-length': String(MAX_IMAGE_SIZE_BYTES + 1),
        },
        body: png,
      }),
    }),
    /larger than the 5 MB limit/
  );
});

test('an oversized body is refused while it streams, even with no content-length', async () => {
  // No content-length to check up front, so the cap has to be enforced as bytes
  // arrive. A response that never ends must still be cut off.
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/huge.png', {
      lookup: publicResolver,
      transport: async () => {
        // A stream that never ends, which is what fakeResponse cannot express:
        // a real response of this kind keeps delivering until the server hangs up.
        const response = Object.assign(new PassThrough(), {
          statusCode: 200,
          headers: { 'content-type': 'image/png' },
        });
        process.nextTick(() => {
          const chunk = Buffer.alloc(256 * 1024, 0x11);
          for (let i = 0; i < 24; i += 1) response.write(chunk); // 6 MB
        });
        return response;
      },
    }),
    /larger than the 5 MB limit/
  );
});

test('an empty response is refused', async () => {
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/empty.png', {
      lookup: publicResolver,
      transport: async () => fakeResponse({ headers: { 'content-type': 'image/png' }, body: Buffer.alloc(0) }),
    }),
    /empty response/
  );
});

test('an error status is refused without echoing the body', async () => {
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/missing.png', {
      lookup: publicResolver,
      transport: async () => fakeResponse({
        status: 404,
        headers: { 'content-type': 'text/html' },
        body: Buffer.from('Not Found: /internal/secret-path'),
      }),
    }),
    (error) => {
      assert.match(error.message, /did not return an image/);
      assert.doesNotMatch(error.message, /secret-path|Not Found/);
      return true;
    }
  );
});

test('a failed connection is reported without internal detail', async () => {
  await assert.rejects(
    () => fetchRemoteImage('https://example.com/cover.png', {
      lookup: publicResolver,
      transport: async () => {
        throw Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:22'), { code: 'ECONNREFUSED' });
      },
    }),
    (error) => {
      assert.match(error.message, /could not be reached/);
      assert.doesNotMatch(error.message, /ECONNREFUSED|127\.0\.0\.1/);
      return true;
    }
  );
});

// ==========================================
// THE ROUTE
// ==========================================

test('the import route requires authentication', async () => {
  const res = await request(app).post(IMPORT_PATH).send({ url: 'https://example.com/a.png' });
  assert.equal(res.status, 401);
});

test('the import route refuses a private URL before any network access', async () => {
  const res = await importWith('http://169.254.169.254/latest/meta-data/');

  assert.equal(res.status, 400);
  assert.match(res.body.msg, /cannot be used/);
  // Nothing about the internal address may appear in the response.
  assert.doesNotMatch(JSON.stringify(res.body), /169\.254|meta-data/);
});

test('the import route refuses a non-http URL', async () => {
  const res = await importWith('file:///etc/passwd');

  assert.equal(res.status, 400);
  assert.match(res.body.msg, /http:\/\/ or https:\/\//);
  assert.doesNotMatch(JSON.stringify(res.body), /passwd/);
});

test('the import route refuses a missing or malformed URL', async () => {
  const missing = await withAdminSession(() =>
    request(app).post(IMPORT_PATH).set('Cookie', [`token=${ADMIN_TOKEN}`]).send({}));
  assert.equal(missing.status, 400);

  const malformed = await importWith('nonsense');
  assert.equal(malformed.status, 400);
  assert.match(malformed.body.msg, /valid URL/);
});

test('the import route never returns anything but a stored URL', async () => {
  // Cloudinary is unconfigured in tests, so the request is refused at the
  // storage step. What matters here is the shape of the refusal: a message, and
  // no provider, path or credential detail.
  const res = await importWith('https://example.com/cover.png');

  assert.equal(res.status, 400);
  assert.match(res.body.msg, /not available right now/);
  assert.doesNotMatch(JSON.stringify(res.body), /cloudinary|api_key|api_secret|public_id/i);
});

// ==========================================
// THE PINNED LOOKUP
// ==========================================
// Every test above injects a stub transport, so none of them execute the real
// socket layer. That layer is where the DNS-rebinding guard lives: it hands Node
// a `lookup` that returns the address already validated instead of resolving the
// name again. Node decides which shape it wants by setting `all` on the options
// it passes to that function — an array of { address, family } when
// autoSelectFamily is on (the default since Node 20), otherwise the scalar
// (address, family). Answering the wrong one is silent at the JS level and
// catastrophic at runtime: Node reads the string as a list, tries to connect to
// `undefined`, and the import fails for every URL with "That host could not be
// reached". So the contract is pinned here, where it cannot drift unnoticed.

test('the pinned lookup answers Node in whichever shape it asks for', async () => {
  const originalRequest = https.request;
  let options = null;

  // A request that never opens a socket: it records the options, then fails, so
  // the assertion below is about the lookup and nothing else.
  https.request = (received) => {
    options = received;
    const listeners = {};
    const request = {
      setTimeout: () => request,
      on: (event, handler) => {
        listeners[event] = handler;
        return request;
      },
      end: () => {
        setImmediate(() => listeners.error?.(new Error('deliberate')));
        return request;
      },
    };
    return request;
  };

  try {
    await assert.rejects(
      () => fetchRemoteImage('https://example.com/cover.png', { lookup: publicResolver }),
      /could not be reached/
    );
  } finally {
    https.request = originalRequest;
  }

  assert.ok(options, 'the real transport must have been reached');
  assert.equal(typeof options.lookup, 'function');

  // The array form, which is the one Node 20+ asks for by default.
  const arrayForm = [];
  options.lookup('example.com', { all: true }, (err, addresses) => arrayForm.push({ err, addresses }));
  assert.equal(arrayForm.length, 1);
  assert.equal(arrayForm[0].err, null);
  assert.deepEqual(arrayForm[0].addresses, [{ address: '93.184.216.34', family: 4 }]);

  // The scalar form, for a Node that asks for it instead.
  const scalarForm = [];
  options.lookup('example.com', {}, (err, address, family) => scalarForm.push({ err, address, family }));
  assert.equal(scalarForm.length, 1);
  assert.equal(scalarForm[0].err, null);
  assert.equal(scalarForm[0].address, '93.184.216.34');
  assert.equal(scalarForm[0].family, 4);

  // Whichever form is used, the address is the one that was validated and never
  // the name — that is the whole point of the override.
  const addresses = Array.isArray(arrayForm[0].addresses)
    ? arrayForm[0].addresses.map((entry) => entry.address)
    : [scalarForm[0].address];
  assert.ok(!addresses.includes('example.com'));
});
