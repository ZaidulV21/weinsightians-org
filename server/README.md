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

---

## Overview

This server provides a complete backend for a blog platform with the following capabilities:

- **Public access** to read blog posts
- **Admin-only access** to create, update, and delete posts
- **One-time bootstrap** route for initial admin setup
- **Stateless authentication** using JWT stored in HTTP-only cookies
- **Input validation** using `express-validator`
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
├── controllers/
│   ├── authController.js      # Login, logout, bootstrap logic
│   └── blogController.js      # CRUD operations for blogs
├── errors/
│   └── customErrors.js        # Custom API error classes
├── middlewares/
│   ├── adminRouteMiddleware.js       # Enforces admin role
│   ├── authenticationMiddleware.js   # Verifies JWT from cookies
│   ├── errorHandlerMiddleware.js     # Central error handler
│   ├── notFoundMiddleware.js         # 404 handler
│   └── validationMiddleware.js       # Input validation rules
├── models/
│   ├── Blog.js                # Blog post schema
│   └── User.js                # User (admin) schema
├── routes/
│   ├── authRoutes.js          # Auth-related routes
│   └── blogRoutes.js          # Blog CRUD routes
├── utils/
│   ├── corsUtils.js           # CORS configuration
│   ├── passwordUtils.js       # Password hashing utilities
│   └── tokenUtils.js          # JWT creation & verification
├── .env                       # Environment variables (not committed)
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

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=6200                      # Port the server listens on

# Database
MONGO_URL=mongodb+srv://...    # MongoDB connection string (Atlas or local)

# JWT Configuration
JWT_SECRET=your_secret_key     # Secret key for signing JWTs (use a strong random string)
JWT_EXPIRES_IN=1d              # Token expiration (e.g., 1d, 7d, 24h)

# Environment
NODE_ENV=development           # 'development' or 'production'
```

| Variable        | Required | Description                                                                 |
|-----------------|----------|-----------------------------------------------------------------------------|
| `PORT`          | No       | Server port. Defaults to `5000` if not specified.                          |
| `MONGO_URL`     | **Yes**  | MongoDB connection URI. Use Atlas connection string or local MongoDB URI.  |
| `JWT_SECRET`    | **Yes**  | Secret key for signing/verifying JWTs. Use a cryptographically random string. |
| `JWT_EXPIRES_IN`| **Yes**  | JWT lifetime. Accepts values like `1d`, `7d`, `2h`, `30m`.                 |
| `NODE_ENV`      | No       | Set to `production` for secure cookies; `development` enables morgan logs. |

> **Security Note:** Generate `JWT_SECRET` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

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
| POST   | `/api/v1/auth/logout`| No            | Clear authentication cookie |

**Response (200 OK):**
```json
{
  "msg": "user logged out"
}
```

---

### Blog Endpoints

All blog routes are prefixed with `/api/v1/blogs`.

#### Get All Blogs

| Method | Endpoint        | Auth Required | Description                     |
|--------|-----------------|---------------|---------------------------------|
| GET    | `/api/v1/blogs` | No            | Retrieve all blog posts         |

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
  "author": "Jane Smith"
}
```

**Validation Rules:**
| Field         | Rules                                    |
|---------------|------------------------------------------|
| `title`       | Required, max 200 characters             |
| `description` | Required, max 500 characters             |
| `content`     | Required                                 |
| `author`      | Required                                 |

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
    "createdAt": "2024-01-20T14:00:00.000Z",
    "updatedAt": "2024-01-20T14:00:00.000Z"
  }
}
```

---

#### Update Blog

| Method | Endpoint              | Auth Required | Description           |
|--------|----------------------|---------------|-----------------------|
| PATCH  | `/api/v1/blogs/:id`  | **Yes (Admin)** | Update an existing blog |

**Request Body:** Same as Create Blog (all fields required)

**Response (200 OK):**
```json
{
  "msg": "blog updated",
  "blog": { ... }
}
```

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

1. **`authenticateUser`** – Extracts and verifies JWT from cookies
2. **`adminRouteMiddleware`** – Checks if user has `admin` role
3. **Validation Middleware** – Validates request body/params
4. **Controller** – Handles business logic

### Data Models

#### User Model
| Field      | Type   | Constraints                              |
|------------|--------|------------------------------------------|
| `name`     | String | Required, 3-50 characters                |
| `email`    | String | Required, unique, valid email format     |
| `password` | String | Required, min 6 characters, hidden in queries |
| `role`     | String | Enum: `['admin']`, default: `admin`      |

#### Blog Model
| Field         | Type   | Constraints                    |
|---------------|--------|--------------------------------|
| `title`       | String | Required, max 200 characters   |
| `description` | String | Required, max 500 characters   |
| `content`     | String | Required                       |
| `author`      | String | Required                       |
| `createdAt`   | Date   | Auto-generated                 |
| `updatedAt`   | Date   | Auto-updated                   |

---

## Error Handling

The API uses custom error classes with appropriate HTTP status codes:

| Error Class       | Status Code | Usage                                |
|-------------------|-------------|--------------------------------------|
| `BadRequestError` | 400         | Invalid input or validation failure  |
| `UnauthorizedError`| 401        | Missing or invalid authentication    |
| `ForbiddenError`  | 403         | Insufficient permissions             |
| `NotFoundError`   | 404         | Resource not found                   |

**Error Response Format:**
```json
{
  "msg": "error description"
}
```

---

## Security Features

- **HTTP-only Cookies:** JWTs are stored in HTTP-only cookies, preventing XSS attacks
- **Secure Cookies:** In production, cookies are sent only over HTTPS
- **SameSite=Strict:** Prevents CSRF attacks by restricting cookie transmission
- **Password Hashing:** bcrypt with salt rounds for secure password storage
- **Input Validation:** All inputs validated using express-validator before processing
- **CORS Configuration:** Configurable allowed origins for cross-origin requests

---

## License

ISC
