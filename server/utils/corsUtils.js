// ==========================================
// CORS ALLOWLIST
// ==========================================
// The admin panel (https://weinsightian.tech) and the API
// (https://weinsightians-backend-repo.onrender.com) are different origins, so the
// auth cookie must be SameSite=None + Secure. That combination means the browser
// attaches the cookie to *any* cross-site request, so the origin allowlist below
// is the only thing keeping a random website from calling the admin API with the
// visitor's session.
//
// A wildcard origin is never used: it is rejected by the browser as soon as
// credentials are enabled, and it would hand every site on the internet a
// cookie-bearing channel to the CMS.

import { parseEnvList } from './envUtils.js';

// Origins that are always allowed.
const BUILT_IN_ORIGINS = [
  'https://weinsightian.tech',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const configuredOrigins = [
  ...parseEnvList(process.env.FRONTEND_URL),
  ...parseEnvList(process.env.ALLOWED_ORIGINS),
];

// De-duplicated allowlist, trailing slashes removed.
export const allowedOrigins = Array.from(
  new Set([...BUILT_IN_ORIGINS, ...configuredOrigins].map((origin) => origin.replace(/\/+$/, '')))
);

export const isAllowedOrigin = (origin) => {
  if (!origin) return false;
  return allowedOrigins.includes(origin.replace(/\/+$/, ''));
};

const corsOptions = {
  origin(origin, callback) {
    // Requests with no Origin header are same-origin navigations, curl, health
    // checks and server-to-server calls. They carry no ambient cookie authority
    // from another site, so they are allowed through.
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  maxAge: 600,
  optionsSuccessStatus: 204,
};

export default corsOptions;
