// ==========================================
// HTML SANITIZATION
// ==========================================
// Blog bodies are authored in React-Quill and are plain strings in MongoDB. The
// public site renders them with dangerouslySetInnerHTML, so anything stored here
// executes in every visitor's browser. ReactQuill is an editor, not a sanitizer:
// it never blocks a pasted <script>, a javascript: link, or an onerror handler —
// those simply come from the clipboard or straight from the request body.
//
// The rule for this file: sanitize on the way IN (server-side, always, no
// matter which client posts), and keep the allowlist tight enough that a
// rendering bug in the frontend cannot become stored XSS.
//
// Formatting that is intentionally preserved: headings, paragraphs, bold,
// italic, underline, strike, ordered/unordered lists, blockquotes, code blocks,
// links, images, plus the colour / background / alignment / indent formatting
// that the Quill toolbar produces.

import sanitizeHtml from 'sanitize-html';

export const ALLOWED_LINK_SCHEMES = ['http', 'https', 'mailto', 'tel'];

// Only ordinary web links survive. javascript:, data:, vbscript:, file: and
// every other executable scheme are stripped from href/src by this list.
const ALLOWED_SCHEMES = [...ALLOWED_LINK_SCHEMES];

// Colours, background colours, alignment and indentation — the inline styles
// Quill writes. Each pattern is anchored, so `url(...)`, `expression(...)` and
// `behavior` are all rejected here. sanitize-html matches these with
// RegExp.test(), so they must be real RegExp objects, not strings.
const COLOUR_VALUE = [
  /^#(0x)?[0-9a-f]{3,8}$/i,
  /^rgb\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)$/i,
  /^rgba\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(0|1|0?\.\d+|100%)\s*\)$/i,
  /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/i,
  /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|1|0?\.\d+|100%)\s*\)$/i,
  /^(inherit|transparent|currentcolor|black|white|red|green|blue|yellow|orange|purple|gray|grey|silver|maroon|navy|teal|olive|lime|aqua|fuchsia)$/i,
];

const TEXT_ALIGN_VALUES = [/^left$/i, /^right$/i, /^center$/i, /^justify$/i];
const FONT_SIZE_VALUES = [
  /^\d{1,3}(\.\d{1,2})?(px|pt|em|rem|%)$/i,
  /^(larger|smaller|xx-small|x-small|small|medium|large|x-large|xx-large)$/i,
];
const FONT_FAMILY_VALUES = [/^[a-z0-9 ,\-'"]{1,80}$/i];
const LENGTH_VALUE = [/^\d{1,4}(px|pt|em|rem|%)$/i];

const sanitizeOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup', 'small', 'mark',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code', 'span', 'div', 'section', 'a', 'img', 'figure', 'figcaption',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    li: ['data-list'],
    '*': ['class', 'style', 'dir', 'lang'],
  },
  // Quill encodes indentation, alignment, fonts and code blocks as its own class
  // names (ql-indent-2, ql-align-center, ql-syntax, ...). Only `ql-*` is
  // allowed, so nothing arbitrary can be attached to an element.
  allowedClasses: {
    '*': ['ql-*'],
  },
  allowedStyles: {
    '*': {
      color: COLOUR_VALUE,
      'background-color': COLOUR_VALUE,
      'text-align': TEXT_ALIGN_VALUES,
      'font-size': FONT_SIZE_VALUES,
      'font-weight': [/^bold$/i, /^normal$/i, /^[1-9]00$/],
      'font-style': [/^italic$/i, /^normal$/i],
      'text-decoration': [/^underline$/i, /^line-through$/i, /^none$/i],
      'font-family': FONT_FAMILY_VALUES,
      'padding-left': LENGTH_VALUE,
      'padding-right': LENGTH_VALUE,
      'margin-left': LENGTH_VALUE,
      'margin-right': LENGTH_VALUE,
      'text-indent': LENGTH_VALUE,
      'list-style-type': [/^disc$/i, /^circle$/i, /^square$/i, /^decimal$/i, /^none$/i],
    },
  },
  // Everything listed here loses its inner content, not just its tag.
  nonTextTags: [
    'style', 'script', 'textarea', 'option', 'noscript', 'iframe', 'object',
    'embed', 'applet', 'form', 'input', 'button', 'select', 'template',
  ],
  allowedSchemes: ALLOWED_SCHEMES,
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: false,
  // Never emit script/style/iframe even if something upstream re-adds them.
  allowVulnerableTags: false,
  transformTags: {
    // A link opened in a new tab must not hand the opener window to the target
    // site, and user-supplied links should not pass on SEO equity.
    a: (tagName, attribs) => {
      const next = { ...attribs, rel: 'noopener noreferrer nofollow' };
      if (attribs.target === '_blank') {
        next.target = '_blank';
      } else {
        delete next.target;
      }
      return { tagName: 'a', attribs: next };
    },
    img: (tagName, attribs) => ({
      tagName: 'img',
      attribs: { ...attribs, loading: 'lazy' },
    }),
  },
};

export const sanitizeBlogContent = (html) => {
  if (typeof html !== 'string' || html.trim() === '') return '';
  return sanitizeHtml(html, sanitizeOptions);
};

// ==========================================
// PLAIN TEXT FIELDS (title / description / author)
// ==========================================
// These are always rendered as text, never as markup, so the goal is simply to
// store text: entities decoded, tags gone, whitespace collapsed.

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

const fromCodePoint = (code, fallback) => {
  if (!Number.isInteger(code) || code < 32 || code > 0x10ffff) return fallback;
  try {
    return String.fromCodePoint(code);
  } catch {
    return fallback;
  }
};

const decodeEntities = (value) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => fromCodePoint(parseInt(hex, 16), match))
    .replace(/&#(\d+);/g, (match, dec) => fromCodePoint(parseInt(dec, 10), match))
    .replace(/&([a-z][a-z0-9]*);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);

export const toPlainText = (value) =>
  decodeEntities(String(value ?? ''))
    // script/style bodies are dropped entirely, not flattened into visible text
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    // any stray angle bracket is removed, so no markup can ever be reconstructed
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// True when the HTML contains something a reader would actually see. A body of
// "<p><br></p>" — what an empty editor submits — is whitespace-only content and
// is rejected instead of being stored as an "empty" post.
export const hasVisibleText = (html) => toPlainText(html).length > 0;
