import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizeBlogContent,
  hasVisibleText,
  toPlainText,
  ALLOWED_LINK_SCHEMES,
} from '../utils/sanitizeUtils.js';

// ==========================================
// STORED XSS
// ==========================================

test('script tags are removed with their contents', () => {
  const dirty = '<p>Hello</p><script>alert(document.cookie)</script>';
  const clean = sanitizeBlogContent(dirty);
  assert.ok(!clean.includes('script'), clean);
  assert.ok(!clean.includes('alert'), clean);
  assert.ok(clean.includes('<p>Hello</p>'));
});

test('event handler attributes are stripped', () => {
  const vectors = [
    '<img src="https://example.com/a.png" onerror="alert(1)">',
    '<p onmouseover="steal()">text</p>',
    '<div onclick="x()" style="color: red">text</div>',
    '<body onload="x()">text</body>',
    '<details open ontoggle="x()">text</details>',
  ];

  vectors.forEach((vector) => {
    const clean = sanitizeBlogContent(vector);
    assert.ok(!/\son[a-z]+=/i.test(clean), `event handler survived: ${clean}`);
    assert.ok(!clean.includes('alert'), clean);
    assert.ok(!clean.includes('steal'), clean);
  });
});

test('iframe, object, embed, form and style payloads are removed', () => {
  const dirty =
    '<iframe src="https://evil.example"></iframe>' +
    '<object data="x.swf"></object>' +
    '<embed src="x.swf">' +
    '<form action="https://evil.example"><input name="a"></form>' +
    '<style>body{display:none}</style>' +
    '<p>safe</p>';

  const clean = sanitizeBlogContent(dirty);
  ['iframe', 'object', 'embed', 'form', 'input', 'style', 'display:none'].forEach((needle) => {
    assert.ok(!clean.includes(needle), `${needle} survived: ${clean}`);
  });
  assert.ok(clean.includes('<p>safe</p>'));
});

test('svg payloads are removed even when nested', () => {
  const dirty = '<svg><script>alert(1)</script></svg><p>after</p>';
  const clean = sanitizeBlogContent(dirty);
  assert.ok(!clean.includes('<svg'), clean);
  assert.ok(!clean.includes('alert'), clean);
  assert.ok(clean.includes('after'));
});

// ==========================================
// LINK SECURITY
// ==========================================

test('dangerous URL schemes cannot survive in links', () => {
  const vectors = [
    '<a href="javascript:alert(1)">click</a>',
    '<a href="JaVaScRiPt:alert(1)">click</a>',
    '<a href="java\tscript:alert(1)">click</a>',
    '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">click</a>',
    '<a href="vbscript:msgbox(1)">click</a>',
    '<a href="file:///etc/passwd">click</a>',
  ];

  vectors.forEach((vector) => {
    const clean = sanitizeBlogContent(vector);
    assert.ok(!/href\s*=/i.test(clean), `href survived: ${clean}`);
    assert.ok(!/javascript|vbscript|data:text\/html/i.test(clean), clean);
  });
});

test('protocol relative URLs are not treated as safe', () => {
  const clean = sanitizeBlogContent('<a href="//evil.example/x">click</a>');
  assert.ok(!clean.includes('evil.example'), clean);
});

test('legitimate links are preserved', () => {
  const vectors = [
    ['<a href="https://weinsightian.tech/blog">https</a>', 'https://weinsightian.tech/blog'],
    ['<a href="http://example.com/page">http</a>', 'http://example.com/page'],
    ['<a href="mailto:hello@weinsightian.tech">mail</a>', 'mailto:hello@weinsightian.tech'],
    ['<a href="tel:+911234567890">phone</a>', 'tel:+911234567890'],
  ];

  vectors.forEach(([input, expected]) => {
    const clean = sanitizeBlogContent(input);
    assert.ok(clean.includes(expected), `${expected} was removed from ${clean}`);
  });

  assert.deepEqual(ALLOWED_LINK_SCHEMES, ['http', 'https', 'mailto', 'tel']);
});

test('links get a safe rel, and target is only kept for _blank', () => {
  const blank = sanitizeBlogContent('<a href="https://example.com" target="_blank">x</a>');
  assert.ok(blank.includes('rel="noopener noreferrer nofollow"'), blank);
  assert.ok(blank.includes('target="_blank"'), blank);

  const hostile = sanitizeBlogContent('<a href="https://example.com" target="weinsightian">x</a>');
  assert.ok(!hostile.includes('target='), hostile);
});

// ==========================================
// LEGITIMATE FORMATTING IS PRESERVED
// ==========================================

test('Quill formatting is preserved', () => {
  const quill =
    '<h1>Heading</h1>' +
    '<h2>Sub</h2>' +
    '<p><strong>bold</strong> <em>italic</em> <u>underline</u> <s>strike</s></p>' +
    '<ul><li>one</li><li>two</li></ul>' +
    '<ol><li>first</li></ol>' +
    '<blockquote>quoted</blockquote>' +
    '<pre class="ql-syntax">const a = 1;</pre>' +
    '<p class="ql-align-center" style="text-align: center;">centred</p>' +
    '<span style="color: rgb(255, 0, 0);">red</span>' +
    '<span style="background-color: #ffff00;">highlighted</span>' +
    '<p class="ql-indent-1" style="padding-left: 3em;">indented</p>' +
    '<p><a href="https://example.com">link</a></p>';

  const clean = sanitizeBlogContent(quill);

  [
    '<h1>Heading</h1>',
    '<h2>Sub</h2>',
    '<strong>bold</strong>',
    '<em>italic</em>',
    '<u>underline</u>',
    '<s>strike</s>',
    '<ul>',
    '<ol>',
    '<blockquote>quoted</blockquote>',
    'ql-syntax',
    'text-align:center',
    'color:rgb(255, 0, 0)',
    'background-color:#ffff00',
    'padding-left:3em',
    'ql-indent-1',
  ].forEach((needle) => {
    assert.ok(clean.includes(needle), `${needle} was stripped from: ${clean}`);
  });
});

test('style values cannot smuggle url(), expression() or behaviour', () => {
  const vectors = [
    '<span style="background-image: url(javascript:alert(1))">x</span>',
    '<div style="width: expression(alert(1))">x</div>',
    '<p style="behavior: url(#default#time2)">x</p>',
    '<span style="color: red; position: fixed; top: 0">x</span>',
  ];

  vectors.forEach((vector) => {
    const clean = sanitizeBlogContent(vector);
    assert.ok(!/expression|url\(|behavior|position/i.test(clean), clean);
  });
});

test('images keep a safe src and gain lazy loading', () => {
  const clean = sanitizeBlogContent('<img src="https://res.example.com/a.jpg" alt="a" onerror="x()">');
  assert.ok(clean.includes('src="https://res.example.com/a.jpg"'), clean);
  assert.ok(clean.includes('loading="lazy"'), clean);
  assert.ok(!clean.includes('onerror'), clean);
});

test('non-ql classes are dropped', () => {
  const clean = sanitizeBlogContent('<p class="evil-tracking" style="color: red">x</p>');
  assert.ok(!clean.includes('evil-tracking'), clean);
  assert.ok(clean.includes('color:red'), clean);
});

// ==========================================
// PLAIN TEXT FIELDS
// ==========================================

test('plain text fields never keep markup', () => {
  assert.equal(toPlainText('<script>alert(1)</script>Hello'), 'Hello');
  assert.equal(toPlainText('  spaced   out  '), 'spaced out');
  assert.equal(toPlainText('a &amp; b'), 'a & b');
});

test('whitespace-only content is detected as empty', () => {
  assert.equal(hasVisibleText('<p><br></p>'), false);
  assert.equal(hasVisibleText('<p>&nbsp;</p>'), false);
  assert.equal(hasVisibleText('   '), false);
  assert.equal(hasVisibleText('<p>real words</p>'), true);
  assert.equal(sanitizeBlogContent(''), '');
  assert.equal(sanitizeBlogContent(null), '');
});
