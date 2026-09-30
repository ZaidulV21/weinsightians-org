# Blogs Server

A RESTful blog API built with **Node.js** and **Express.js**, featuring JWT-based authentication via HTTP-only cookies, MongoDB persistence, and role-based access control.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
  - [Health Check](#health-check)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Blog Endpoints](#blog-endpoints)
- [Core Functionalities](#core-functionalities)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Tests and Maintenance Scripts](#tests-and-maintenance-scripts)

---

## Overview

This server provides a complete backend for a blog platform with the following capabilities:

- **Public access** to read published blog posts
- **Admin-only access** to create, edit, publish, unpublish, and delete posts
- **Draft support:** a post can be written privately and published later
- **One-time bootstrap** route for initial admin setup
- **Revocable sessions** using a JWT in an HTTP-only cookie, backed by `tokenVersion`
- **Input validation** using `express-validator`
- **Stored-content sanitisation** so a post cannot smuggle a script to readers
- **Rate limiting, origin checks, and safe error responses**
- **Centralized error handling** with custom error classes

---

## Tech Stack

| Category       | Technology                                     |
|----------------|------------------------------------------------|
| Runtime        | Node.js (ES Modules)                           |
| Framework      | Express.js v4                                  |
| Database       | MongoDB Atlas (via Mongoose)                   |
| Authentication | JSON Web Tokens (JWT) with HTTP-only cookies   |
| Validation     | express-validator                              |
| Password Hash  | bcryptjs                                       |
| Dev Tools      | nodemon, morgan                                |

---

## Project Structure

```
blogs-server/
├── config/
│   ├── cloudinary.js          # Cloudinary config, upload and delete
│   └── loadEnv.js             # Loads .env once, before anything reads it
├── controllers/
│   ├── authController.js      # Login, logout, session, bootstrap logic
│   └── blogController.js      # CRUD, publishing and image upload logic
├── errors/
│   └── customErrors.js        # Custom API error classes
├── middlewares/
│   ├── adminRouteMiddleware.js       # Enforces admin role
│   ├── authenticationMiddleware.js   # Verifies JWT and tokenVersion
│   ├── csrfProtection.js             # Origin / Referer check on writes
│   ├── errorHandlerMiddleware.js     # Central error handler
│   ├── notFoundMiddleware.js         # 404 handler
│   ├── rateLimitMiddleware.js        # Login, bootstrap and write limits
│   ├── upload.js                     # Multipart image upload rules
│   └── validationMiddleware.js       # Input validation rules
├── models/
│   ├── Blog.js                # Blog post schema, slug and publish helpers
│   └── User.js                # User (admin) schema
├── routes/
│   ├── authRoutes.js          # Auth-related routes
│   └── blogRoutes.js          # Public and admin blog routes
├── scripts/
│   ├── backfillPublishedAt.js # Fills missing publish dates
│   └── smokeCheck.js          # 15 read-only checks against a deployed API
├── tests/                     # Automated tests, no database required
├── utils/
│   ├── corsUtils.js           # CORS configuration
│   ├── fileValidation.js      # Image type and size checks
│   ├── passwordUtils.js       # Password hashing utilities
│   ├── sanitizeUtils.js       # Strips unsafe HTML before storage
│   ├── slugUtils.js           # Slug generation and URL validation
│   └── tokenUtils.js          # JWT creation & verification
├── .env                       # Environment variables (not committed)
├── .env.example               # Template for the above
├── .gitignore
├── package.json
└── server.js                  # Application entry point
```

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** v18.x or higher
- **npm** v9.x or higher
- **MongoDB Atlas** account (or local MongoDB instance)

---

## Environment Variables

Create a `.env` file in the project root with the variables below. Copy
`.env.example` to get the same list:

```env
# Server Configuration
PORT=6200                      # Port the server listens on

# Database
MONGO_URL=mongodb+srv://...    # MongoDB connection string (Atlas or local)

# JWT Configuration
JWT_SECRET=your_secret_key     # Secret key for signing JWTs (use a strong random string)
JWT_EXPIRES_IN=1d              # Token expiration (e.g., 1d, 7d, 24h)

# Environment
NODE_ENV=development           # 'development', 'production' or 'test'

# Cloudinary, for blog images
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Optional: extra browser origins allowed to call the API (comma separated).
# The production frontend is allowed already; add a preview domain if needed.
# FRONTEND_URL=https://weinsightian.tech
# ALLOWED_ORIGINS=https://preview.weinsightian.tech

# Optional: set to "true" to turn rate limiting off while debugging locally.
# RATE_LIMIT_DISABLED=false
```

> **Note:** only server values belong in this file. Anything prefixed `VITE_` is
> read by the React app in the repository root, not by this server.

| Variable        | Required | Description                                                                 |
|-----------------|----------|-----------------------------------------------------------------------------|
| `PORT`          | No       | Server port. Defaults to `6200` if not specified.                          |
| `MONGO_URL`     | **Yes**  | MongoDB connection URI. Use Atlas connection string or local MongoDB URI.  |
| `JWT_SECRET`    | **Yes**  | Secret key for signing/verifying JWTs. Must be at least 32 characters; the server refuses to start in production otherwise. |
| `JWT_EXPIRES_IN`| **Yes**  | JWT lifetime. Accepts values like `1d`, `7d`, `2h`, `30m`.                 |
| `NODE_ENV`      | No       | Set to `production` for secure cookies; `development` enables morgan logs. |
| `CLOUDINARY_CLOUD_NAME` | **Yes** in production | Cloudinary account for image uploads. |
| `CLOUDINARY_API_KEY`    | **Yes** in production | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | **Yes** in production | Cloudinary API secret. |
| `FRONTEND_URL`  | No       | Primary browser origin. `https://weinsightian.tech` is already allowed.    |
| `ALLOWED_ORIGINS` | No     | Extra allowed origins, comma separated, used for preview deployments.     |
| `RATE_LIMIT_DISABLED` | No | Set to `true` to disable rate limiting. Debugging only.                |

> **Security Note:** Generate `JWT_SECRET` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> On Render, set these in the service's Environment settings; the server will
> not read a `server/.env` file there.

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blogs-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy the template above into a `.env` file
   - Fill in your MongoDB connection string and JWT secret

---

## Running the Server

### Development Mode

Uses `nodemon` for auto-reload on file changes:

```bash
npm run dev
```

### Production Mode

Runs the server without file watching:

```bash
npm start
```

Once running, you'll see:

```
MongoDB Atlas connected successfully
Server is running on port 6200...
```

---

## API Documentation

**Base URL:** `/api/v1`

### Health Check

| Method | Endpoint   | Description                    |
|--------|------------|--------------------------------|
| GET    | `/api/v1`  | Verify the API is operational  |

**Response:**
```json
{
  "msg": "Blogs API is running"
}
```

---

### Authentication Endpoints

All authentication routes are prefixed with `/api/v1/auth`.

#### Bootstrap Admin User

| Method | Endpoint             | Auth Required | Description                              |
|--------|----------------------|---------------|------------------------------------------|
| POST   | `/api/v1/auth/bootstrap` | No        | One-time admin user creation             |

> **Important:** This endpoint is **permanently disabled** after the first admin is created.

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "msg": "admin user created successfully",
  "user": {
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "msg": "Admin user already exists"
}
```

---

#### Login

| Method | Endpoint            | Auth Required | Description                              |
|--------|---------------------|---------------|------------------------------------------|
| POST   | `/api/v1/auth/login`| No            | Authenticate and receive JWT cookie      |

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "msg": "user logged in",
  "user": {
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Headers Set:**
```
Set-Cookie: token=<JWT>; HttpOnly; Secure (in production); SameSite=Strict
```

---

#### Logout

| Method | Endpoint             | Auth Required | Description              |
|--------|----------------------|---------------|--------------------------|
| POST   | `/api/v1/auth/logout`| Yes           | Clear cookie and invalidate the session |

**Response (200 OK):**
```json
{
  "msg": "user logged out"
}
```

> **Note:** Logging out increments the account's `tokenVersion`, which immediately
> invalidates any JWT that was issued before the logout. That is what makes a
> stolen cookie worthless once the owner signs out.

---

#### Session Check

| Method | Endpoint          | Auth Required | Description                                |
|--------|-------------------|---------------|--------------------------------------------|
| GET    | `/api/v1/auth/me` | Yes           | Confirm the caller's session and return the user |

**Response (200 OK):**
```json
{
  "msg": "session active",
  "user": {
    "id": "64a...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "msg": "authentication invalid"
}
```

> **Note:** This is what the admin dashboard calls on load, so a session that has
> expired in the browser redirects to the login page instead of rendering a
> dashboard that would fail on its first write.

---

### Blog Endpoints

All blog routes are prefixed with `/api/v1/blogs`.

#### Get All Blogs

| Method | Endpoint        | Auth Required | Description                     |
|--------|-----------------|---------------|---------------------------------|
| GET    | `/api/v1/blogs` | No            | Retrieve published blog posts   |

> **Note:** Drafts are never returned here, and neither is the total count of
> every post. Use `GET /api/v1/blogs/admin/all` for that.

**Response (200 OK):**
```json
{
  "count": 2,
  "blogs": [
    {
      "_id": "64a...",
      "title": "My First Blog",
      "description": "A short intro to my blog",
      "content": "Full blog content here...",
      "author": "John Doe",
      "slug": "my-first-blog",
      "image": null,
      "status": "published",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### Get Single Blog

| Method | Endpoint             | Auth Required | Description                     |
|--------|----------------------|---------------|---------------------------------|
| GET    | `/api/v1/blogs/:id`  | No            | Retrieve a specific blog by ID  |

**URL Parameters:**
| Parameter | Type   | Description                  |
|-----------|--------|------------------------------|
| `id`      | string | Valid MongoDB ObjectId       |

**Response (200 OK):**
```json
{
  "blog": {
    "_id": "64a...",
    "title": "My First Blog",
    "description": "A short intro to my blog",
    "content": "Full blog content here...",
    "author": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### Create Blog

| Method | Endpoint        | Auth Required | Description           |
|--------|-----------------|---------------|-----------------------|
| POST   | `/api/v1/blogs` | **Yes (Admin)** | Create a new blog post |

**Request Body:**
```json
{
  "title": "My New Blog Post",
  "description": "A brief summary of the post",
  "content": "The full content of the blog post...",
  "author": "Jane Smith",
  "status": "draft",
  "image": "https://res.cloudinary.com/.../cover.webp"
}
```

**Validation Rules:**
| Field         | Rules                                    |
|---------------|------------------------------------------|
| `title`       | Required, 3-200 characters               |
| `description` | Required, 10-500 characters              |
| `content`     | Required, 20-200,000 characters          |
| `author`      | Required, 2-100 characters               |
| `status`      | Optional, `draft` or `published` (default `published`) |
| `image`       | Optional, must be a Cloudinary image URL |

**Response (201 Created):**
```json
{
  "msg": "blog created",
  "blog": {
    "_id": "64b...",
    "title": "My New Blog Post",
    "description": "A brief summary of the post",
    "content": "The full content of the blog post...",
    "author": "Jane Smith",
    "slug": "my-new-blog-post",
    "image": null,
    "status": "draft",
    "publishedAt": null,
    "createdAt": "2024-01-20T14:00:00.000Z",
    "updatedAt": "2024-01-20T14:00:00.000Z"
  }
}
```

> **Note:** The `slug` is generated from the title on the server and is not
> accepted from the client, so a title can never be used to inject a URL. If the
> slug is already taken, a short suffix is appended (`my-post-2`).
> `publishedAt` is stamped the first time a post becomes published and is never
> changed afterwards, so republishing keeps the original date.

---

#### Update Blog

| Method | Endpoint              | Auth Required | Description           |
|--------|----------------------|---------------|-----------------------|
| PATCH  | `/api/v1/blogs/:id`  | **Yes (Admin)** | Update an existing blog |

**Request Body:** Any subset of the create fields. Send at least one field; an
empty update is rejected with 400 rather than silently succeeding. `slug` and
`publishedAt` are not writable from the client.

**Response (200 OK):**
```json
{
  "msg": "blog updated",
  "blog": { ... }
}
```

---

#### Publish / Unpublish

| Method | Endpoint                          | Auth Required | Description                     |
|--------|-----------------------------------|---------------|---------------------------------|
| PATCH  | `/api/v1/blogs/:id/status`       | **Yes (Admin)** | Change only the publish state |

**Request Body:**
```json
{ "status": "published" }
```

**Response (200 OK):**
```json
{
  "msg": "blog status updated",
  "blog": { "status": "published", "publishedAt": "2024-01-20T14:00:00.000Z" }
}
```

---

#### Admin: List Every Post

| Method | Endpoint                     | Auth Required | Description                          |
|--------|-----------------------------|---------------|--------------------------------------|
| GET    | `/api/v1/blogs/admin/all`   | **Yes (Admin)** | Every post, drafts included, with counts |

**Response (200 OK):**
```json
{
  "count": 3,
  "publishedCount": 2,
  "draftCount": 1,
  "blogs": [ { "status": "draft", "publishedAt": null } ]
}
```

---

#### Admin: Get a Post by Slug

| Method | Endpoint                              | Auth Required | Description                                |
|--------|---------------------------------------|---------------|--------------------------------------------|
| GET    | `/api/v1/blogs/admin/slug/:slug`     | **Yes (Admin)** | Fetch any post by slug, drafts included     |

**URL Parameters:**
| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `slug`    | string | Post slug, lowercase letters, digits and hyphens |

> **Note:** The public `GET /api/v1/blogs/:slug` will not return a draft, so the
> admin screens use this endpoint to open a draft for editing.

---

#### Delete Blog

| Method | Endpoint              | Auth Required | Description          |
|--------|----------------------|---------------|----------------------|
| DELETE | `/api/v1/blogs/:id`  | **Yes (Admin)** | Delete a blog post   |

**Response (200 OK):**
```json
{
  "msg": "blog deleted"
}
```

---

## Core Functionalities

### Authentication Flow

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   Client    │───────▶│ POST /login  │───────▶│   Server    │
│             │        │              │        │             │
│             │◀───────│  Set-Cookie  │◀───────│ Verify creds│
│             │        │  (JWT token) │        │ Create JWT  │
└─────────────┘        └──────────────┘        └─────────────┘
       │                                              │
       │                                              │
       │            Protected Request                 │
       │         Cookie: token=<JWT>                  │
       ▼                                              ▼
┌─────────────┐                               ┌─────────────┐
│  GET /blogs │─────────────────────────────▶│  Middleware │
│  (create)   │                               │  Verifies   │
│             │◀──────────────────────────────│  JWT token  │
└─────────────┘                               └─────────────┘
```

### Middleware Chain

Protected routes flow through this middleware stack:

1. **`authenticateUser`** — Extracts and verifies the JWT cookie, then confirms the account still exists and its `tokenVersion` still matches
2. **`adminRouteMiddleware`** — Checks that the account has the `admin` role
3. **Rate limiter** — Caps how often login, bootstrap, and write requests can be attempted
4. **Validation Middleware** — Validates request body/params with express-validator
5. **Controller** — Handles business logic

Every request, public or not, also passes through Helmet, the CORS allowlist,
and — for writes — the origin check. Public read routes skip steps 1-3.

### Data Models

#### User Model
| Field         | Type   | Constraints                              |
|---------------|--------|------------------------------------------|
| `name`        | String | Required, 3-50 characters                |
| `email`       | String | Required, unique, lowercase, valid email |
| `password`    | String | Required, min 8 characters, hashed, hidden in queries |
| `role`        | String | Enum: `['admin']`, default: `admin`      |
| `tokenVersion`| Number | Incremented on logout to revoke old tokens |

#### Blog Model
| Field         | Type   | Constraints                              |
|---------------|--------|------------------------------------------|
| `title`       | String | Required, max 200 characters (new posts must be 3-200, enforced on input) |
| `description` | String | Required, max 500 characters (new posts must be 10-500, enforced on input) |
| `content`     | String | Required, sanitized, max 200,000 characters |
| `author`      | String | Required, max 100 characters (new posts must be 2-100, enforced on input) |
| `slug`        | String | Required, unique, lowercase letters/digits/hyphens, generated from the title |
| `image`       | String | Cloudinary image URL, or none            |
| `status`      | String | Enum: `['draft', 'published']`, default `published` |
| `publishedAt` | Date   | Stamped on first publish, kept afterwards, falls back to `createdAt` |
| `createdAt`   | Date   | Auto-generated                           |
| `updatedAt`   | Date   | Auto-updated                             |

> **Note:** posts written before `status` and `slug` existed have no value for
> those fields. They stay public and keep working, which is why the public query
> filters with `publishedFilter()` instead of `status: 'published'` alone.
> `scripts/backfillPublishedAt.js` can fill in the missing date if you want the
> stored data to match.

---

## Error Handling

The API uses custom error classes with appropriate HTTP status codes:

| Error Class       | Status Code | Usage                                |
|-------------------|-------------|--------------------------------------|
| `BadRequestError` | 400         | Invalid input, or a rejected file    |
| `UnauthorizedError`| 401        | Missing or invalid authentication    |
| `ForbiddenError`  | 403         | Insufficient permissions, or a write from a disallowed origin |
| `NotFoundError`   | 404         | Resource not found                   |
| `PayloadTooLargeError` | 413    | Upload over the 5 MB limit           |
| (rate limiter)    | 429         | Too many attempts in a short window  |

**Error Response Format:**
```json
{
  "msg": "error description"
}
```

**What the client does not get:** stack traces, file paths, Mongoose or MongoDB
messages, or a hint about which half of a credential was wrong. Unexpected errors
are logged on the server and answered with a single generic 500 message, and
validation failures name the field rather than dumping the whole body.

---

## Security Features

**Session and cookies**
- **HTTP-only cookies:** the JWT is never readable from JavaScript, so an XSS bug cannot exfiltrate the session
- **Secure in production:** cookies are only sent over HTTPS
- **SameSite=Strict:** the cookie is not attached to cross-site requests
- **Session revocation:** `tokenVersion` is checked on every request, so logout invalidates existing cookies immediately
- **Login hardening:** a wrong email and a wrong password return the same message, and a dummy hash is compared when no account exists so timing does not reveal which emails are registered

**Authorisation**
- **Admin-only writes:** creating, editing, publishing, and deleting all require a valid admin session
- **No role hierarchy:** every protected route checks for the `admin` role, so there is no "higher" role that bypasses a check
- **One-time bootstrap:** the admin-creation route refuses with 403 as soon as any admin exists

**Input handling**
- **Server-owned slugs:** slugs are generated, validated, and unique, so a title cannot be used to inject a URL
- **Mass-assignment protection:** only known fields are copied from the request body
- **XSS sanitisation:** Quill HTML is stripped of `script`, event handlers, and `javascript:` URLs before it is stored
- **express-validator** on every create, update, and login payload
- **Upload validation:** 5 MB limit, JPEG/PNG/GIF/WebP/AVIF only, and the file's real bytes are checked rather than trusting its name or the browser's content type

**Transport and abuse**
- **Helmet** security headers on every response
- **Explicit CORS allowlist** with credentials; a wildcard origin is never allowed
- **Origin checks on writes** (Origin, Referer, and Fetch Metadata) so a third-party site cannot drive a logged-in browser
- **Rate limits:** 20 login attempts per 15 minutes per IP and email, 5 admin bootstraps per hour, 60 write requests per 15 minutes
- **Safe errors:** clients get a short message; stack traces, driver messages, and file paths stay on the server, and the same 500 message is used for every unexpected error

---

## Tests and Maintenance Scripts

```bash
npm test                                # 123 automated tests, no external services needed
node scripts/smokeCheck.js              # 15 read-only checks against the deployed API
node scripts/smokeCheck.js https://...  # or against a preview deployment
node scripts/backfillPublishedAt.js     # dry run: lists posts missing a publish date
node scripts/backfillPublishedAt.js --apply   # writes the missing dates
```

`npm test` runs the real Express app with only Mongoose replaced, so it needs no
running database and never calls Cloudinary. `smokeCheck.js` only performs reads
and unauthenticated attempts, which are rejected before any data is touched, so
it is safe to point at production. The backfill script fills `publishedAt` from
`createdAt` for posts published before that field existed; it never moves a date
that is already set.

`tests/integration/mongo.test.js` is the exception to the no-database rule: it
runs the same flows against a real MongoDB, which is the only way to exercise
what Mongoose itself does on a write. It needs a one-off
`npm install --no-save mongodb-memory-server` and is run separately:

```bash
node --test --test-timeout=300000 tests/integration/mongo.test.js
```

---

## License

ISC
