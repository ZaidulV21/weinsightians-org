// ==========================================
// SECURITY SMOKE CHECK
// ==========================================
// Re-runs the audit checklist against a deployed API. Every request here is
// read-only or unauthenticated, so it is safe to point at production:
//
//   node scripts/smokeCheck.js
//   node scripts/smokeCheck.js https://staging.example.com
//
// Unauthenticated writes are expected to be refused with 401, and the refusal
// happens before the request reaches a controller, so nothing is created,
// changed or deleted. Supplying real admin credentials is deliberately not
// supported here: the destructive scenarios are covered by the automated suite
// in tests/ instead.

const BASE_URL = (process.argv[2] || 'https://weinsightians-backend-repo.onrender.com').replace(/\/+$/, '');
const API = `${BASE_URL}/api/v1`;

const results = [];

const record = (name, passed, detail) => {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` -> ${detail}` : ''}`);
};

const call = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, {
    redirect: 'manual',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: response.status, body, headers: response.headers };
};

const run = async () => {
  // 1. The public blog is readable without a session.
  const list = await call('/blogs');
  const blogs = Array.isArray(list.body?.blogs) ? list.body.blogs : [];
  record(
    '1. public list is readable without a session',
    list.status === 200 && blogs.length >= 0,
    `status ${list.status}, ${blogs.length} post(s)`
  );

  // 2. A published post is readable by its slug.
  const slug = blogs[0]?.slug;
  if (slug) {
    const single = await call(`/blogs/${encodeURIComponent(slug)}`);
    record(
      '2. a published post is readable by slug',
      single.status === 200 && single.body?.blog?.slug === slug,
      `status ${single.status} for "${slug}"`
    );
  } else {
    record('2. a published post is readable by slug', false, 'no published post to read');
  }

  // 3. An address that does not exist is a clean 404, not a stack trace.
  const missing = await call('/blogs/this-post-does-not-exist-9f2a');
  record(
    '3. an unknown slug is a clean 404',
    missing.status === 404 && missing.body?.success === false,
    `status ${missing.status}`
  );

  // 4-6. Every write is closed to anonymous callers.
  const write = async (name, path, options) => {
    const res = await call(path, options);
    record(name, res.status === 401, `status ${res.status}`);
  };

  await write('4. create without a session is refused', '/blogs', {
    method: 'POST',
    body: JSON.stringify({ title: 'smoke test', description: 'should never be stored', content: '<p>x</p>', author: 'x' }),
  });

  await write('5. update without a session is refused', '/blogs/000000000000000000000000', {
    method: 'PATCH',
    body: JSON.stringify({ title: 'should never be stored' }),
  });

  await write('6. delete without a session is refused', '/blogs/000000000000000000000000', {
    method: 'DELETE',
  });

  // 7-8. The admin reads are closed too, so drafts cannot be discovered.
  const adminList = await call('/blogs/admin/all');
  record('7. admin list without a session is refused', adminList.status === 401, `status ${adminList.status}`);

  const adminSlug = await call('/blogs/admin/slug/anything');
  record('8. admin read by slug without a session is refused', adminSlug.status === 401, `status ${adminSlug.status}`);

  // 9-10. Session endpoints require a session.
  const logout = await call('/auth/logout', { method: 'POST' });
  record('9. logout without a session is refused', logout.status === 401, `status ${logout.status}`);

  const me = await call('/auth/me');
  record('10. session check without a cookie is refused', me.status === 401, `status ${me.status}`);

  // 11. A wrong password says nothing about whether the account exists.
  const badLogin = await call('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nobody@example.invalid', password: 'not-the-password' }),
  });
  const setCookie = badLogin.headers.get('set-cookie');
  record(
    '11. a wrong password is refused and sets no cookie',
    badLogin.status === 401 && !setCookie,
    `status ${badLogin.status}${setCookie ? ' (Set-Cookie present)' : ''}`
  );

  // 12. The one-time admin route is closed once an admin exists.
  const bootstrap = await call('/auth/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ name: 'Second Admin', email: 'second@example.invalid', password: 'whatever12345' }),
  });
  record('12. the one-time admin route stays closed', bootstrap.status === 403, `status ${bootstrap.status}`);

  // 13. A write from another website is stopped by the origin check.
  const crossSite = await call('/blogs', {
    method: 'POST',
    headers: { Origin: 'https://evil.example' },
    body: JSON.stringify({ title: 'csrf probe' }),
  });
  record('13. a cross-site write is refused', crossSite.status === 403, `status ${crossSite.status}`);

  // 14. Security headers are present on API responses.
  const headers = list.headers;
  const hasHeaders = Boolean(
    headers.get('x-content-type-options') && headers.get('x-dns-prefetch-control')
  );
  record('14. security headers are present', hasHeaders, `nosniff: ${headers.get('x-content-type-options')}`);

  // 15. Error bodies never carry internals.
  const bodies = [missing.body, badLogin.body, crossSite.body, adminList.body];
  const clean = bodies.every(
    (body) =>
      typeof body?.msg === 'string' &&
      !JSON.stringify(body).match(/stack|MongoError|at Object|\/api\/v1\/|node_modules/),
  );
  record('15. error responses carry no internals', clean, 'no stack traces or driver messages');

  const failed = results.filter((result) => !result.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed against ${API}`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error('❌ Smoke check could not run:', error?.message || error);
  process.exitCode = 1;
});
