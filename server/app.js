// ==========================================
// EXPRESS APPLICATION
// ==========================================
// Kept separate from server.js so the app can be imported by tests without
// opening a database connection or binding a port.

import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';
import verifyRequestOrigin from './middlewares/csrfProtection.js';
import corsOptions from './utils/corsUtils.js';

const app = express();

// Render terminates TLS at its proxy, so the real client IP arrives in
// X-Forwarded-For. Trusting exactly one hop keeps rate limiting per-user instead
// of collapsing every visitor into the proxy's address.
app.set('trust proxy', 1);

// Security headers. CSP is off because this process only ever returns JSON — the
// public site is a separate deployment.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

if (process.env.NODE_ENV === 'development') {
  // Request lines only. No bodies, no cookies, no secrets.
  app.use(morgan('dev'));
}

// Hard cap on JSON bodies. Blog writes arrive as multipart, so this is only a
// guard against oversized JSON payloads.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());

// Explicit origin allowlist with credentials — never "*".
app.use(cors(corsOptions));

// The auth cookie is SameSite=None (the panel and the API are different sites),
// so cross-site writes are rejected by origin. Must come after cors() so
// preflight OPTIONS requests are answered before this runs.
app.use(verifyRequestOrigin);

// ==========================================
// ROUTES
// ==========================================

app.get('/api/v1', (req, res) => {
  res.json({ msg: 'Blogs API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
