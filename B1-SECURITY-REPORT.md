# B1 — Backend Security & Publishing Report

Date: 30 September 2026
Scope: `server/` (Node + Express + Mongoose) and the admin screens in `src/`.
The public blog UI was not redesigned.

---

## 1. What changed

**Sessions and authentication**

- The JWT lives in an `HttpOnly`, `SameSite=Strict` cookie, `Secure` in production. It is never returned in a response body.
- `GET /auth/me` confirms a session; the admin UI calls it before rendering anything protected.
- `POST /auth/logout` now requires a session, and increments the account's `tokenVersion`. That is checked on every authenticated request, so logging out immediately invalidates a cookie that was already issued — a stolen cookie is worthless after the owner signs out.
- A login with an unknown email compares against a dummy bcrypt hash, and a wrong email and a wrong password return the same message, so neither the response nor its timing reveals which accounts exist.
- `GET /auth/bootstrap` is closed with 403 as soon as one admin exists.
- No role hierarchy: every protected route checks for the `admin` role.

**Authorisation and publishing**

- Creating, editing, publishing, unpublishing and deleting all require an admin session. The public reads stay public and unauthenticated.
- Posts carry `status` (`draft` / `published`) and `publishedAt`. A draft is invisible to `GET /blogs` and returns 404 from `GET /blogs/:slug`; admins read drafts through `GET /blogs/admin/slug/:slug`.
- `publishedAt` is stamped on first publication and never moved afterwards, so unpublishing and republishing does not rewrite a post's history.
- A title edit never changes a slug. The slug is generated on the server, validated as URL-safe, and kept unique, so a title can never be used to inject a URL.
- Only known fields are read from the request body, so a client cannot set `_id`, `slug`, or `publishedAt` itself.

**Input and content**

- Quill HTML is sanitised **before storage**, not just before display, so a stored post cannot carry a script to readers.
- Every payload is validated with express-validator, and an empty `PATCH` is rejected with 400 instead of silently succeeding.
- Uploads are held in memory, capped at 5 MB (a file of exactly 5 MB is accepted), and accepted only as JPEG/PNG/GIF/WebP/AVIF. The file's real bytes are checked — the name and the browser's content type are not trusted.

**Transport and abuse**

- Helmet security headers, an explicit CORS allowlist (never a wildcard), and origin checks on every write using Origin, Referer and Fetch Metadata.
- Rate limits: 20 login attempts per 15 minutes per IP and email, 5 bootstraps per hour, 60 writes per 15 minutes.
- One consistent error shape. Stack traces, driver messages, file paths and field values stay on the server; unexpected failures all return the same generic 500.

---

## 2. The bug that mattered most

Mongoose 9 removed callback-style middleware. The slug hook was written as:

```js
BlogSchema.pre('validate', function normaliseSlug(next) { ...; next(); });
```

Mongoose now calls it with no arguments, so `next()` threw `TypeError: next is not a function` — on **every real create and update**. In production the CMS would have returned 500 for every save.

All 113 pre-existing tests passed, because every write test replaces the Mongoose model, so nothing ever ran a real `doc.save()`. The bug was found by a new offline schema test that validates a real document against the real schema.

The hook is now a plain function, and `tests/blogSchema.test.js` covers it. `tests/integration/mongo.test.js` was written to close the wider gap (Mongoose-level behaviour against a real database) but **has never been run** — see the limitations below.

Three smaller defects were found the same way and fixed:

| Defect | Consequence | Fix |
|---|---|---|
| Login compared against `user.password` without a guard | An account with no hash returned 500 instead of 401 | Compare against the dummy hash when the field is missing |
| Schema `minlength` on title/description/author | An old post with a short description could not be renamed or published, because `save()` validates every field | Minimums live in the validation layer; the schema keeps only structural rules and maximums |
| `ProtectedRoute` trusted the `sessionStorage` marker | A valid cookie in a fresh tab was sent back to the login page | Always ask the server; the marker is only a hint |

---

## 3. Verification

| Check | Result |
|---|---|
| `npm test` (server) | **123 passed, 0 failed** across 10 files |
| `node scripts/smokeCheck.js` against the new build, locally | **15/15 passed** |
| `node scripts/smokeCheck.js` against production | **7/15** — see below |
| `npx eslint src` | clean |
| `npm run build` | 668 modules, built in 5.8s |
| `node scripts/backfillPublishedAt.js` (dry run) | 0 posts needed it; no writes |

The 15-check script only reads, and its write attempts are anonymous and refused at the auth middleware, so it is safe to run against production. The destructive and authenticated scenarios are covered by the test suite instead.

**Production is still running the pre-B1 build.** Eight of the fifteen checks fail against the live service, each one pointing at a fix that has not been deployed yet:

| Check | Live result | Meaning |
|---|---|---|
| Unknown slug | 500 | Leaks internal error detail |
| `GET /blogs/admin/all` | 404 | Route does not exist yet |
| `GET /blogs/admin/slug/:slug` | 404 | Route does not exist yet |
| `POST /auth/logout` without a session | 200 | Logout is currently unauthenticated |
| `GET /auth/me` | 404 | Route does not exist yet |
| Cross-site write | 401 | Rejected by auth, not by an origin check |
| Security headers | absent | Helmet is not deployed |
| Error bodies clean | fails | Follows from the 500 above |

The public blog is currently serving normally: one post, readable by list and by slug.

---

## 4. Known limitations

- **The live service needs a deploy** before any of this is in effect. Nothing in the report is true in production until then.
- **The database integration test has never been executed.** `tests/integration/mongo.test.js` needs a MongoDB binary; the machine ran out of disk space fetching it. Treat its first run as a debugging session, not a green test. `mongodb-memory-server` is not a dependency of the project and was removed again after the attempt.
- **No authenticated check was run against production**, because it needs admin credentials and the remaining scenarios would write real data. They are covered by the test suite instead.
- **Disk space on this machine is critical** — about 1 GB free. Worth clearing before the next dependency install.
- `dist/` is tracked in git, so the build rewrote committed assets. Expect churn there in the diff.
- The main JS bundle is 946 kB and Vite warns about it. Pre-existing, and a performance task rather than a security one.
- `.env` in `server/` contains a stray `password` key alongside the real settings. It is gitignored and was left untouched, but it is worth removing, and it is not a variable this server reads.

---

## 5. Deploy checklist

1. Set `NODE_ENV=production`, `MONGO_URL`, `JWT_SECRET` (32+ characters), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in the Render service settings. The production frontend origin is already allowed, so `FRONTEND_URL` is optional.
2. Deploy the server, then the frontend.
3. Run `node scripts/smokeCheck.js` and confirm **15/15** — that is the fastest way to prove the new build is live.
4. Sign in to the admin dashboard and confirm the session check, then create one draft and publish it. The public blog must not show the draft until it is published.
5. Optional: `node scripts/backfillPublishedAt.js` to store publish dates for old posts. Currently a no-op.
