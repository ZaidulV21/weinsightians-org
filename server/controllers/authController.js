import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { UnauthorizedError, ForbiddenError } from '../errors/customErrors.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { attachCookiesToResponse, clearAuthCookie } from '../utils/tokenUtils.js';

// A bcrypt hash of a value nobody can log in with. Comparing against it when the
// account does not exist makes a missing account take the same time as a wrong
// password, so response timing cannot be used to enumerate admin emails.
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// ==========================================
// POST /api/v1/auth/login
// ==========================================
// One failure message for every wrong email, wrong password, or unknown account.
export const login = async (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password || '';

  // `+password` because the field is select: false in the schema. The hash is
  // used for comparison only and is never returned.
  const user = await User.findOne({ email }).select('+password');

  // A malformed account with no hash must fail the login like any other bad
  // credential, not turn into a 500 that tells an attacker the account is broken.
  const storedHash = user?.password || DUMMY_HASH;

  const isPasswordCorrect = await comparePassword(password, storedHash);

  if (!user || !isPasswordCorrect) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // The token never reaches JavaScript: HttpOnly cookie, Secure in production,
  // SameSite=None because the panel and the API are different sites.
  attachCookiesToResponse(res, user);

  res.status(StatusCodes.OK).json({
    msg: 'user logged in',
    message: 'user logged in',
    user: { name: user.name, email: user.email, role: user.role },
  });
};

// ==========================================
// GET /api/v1/auth/me
// ==========================================
// Lets the admin UI ask the server whether the session is still real instead of
// trusting a flag in browser storage. Requires a valid token.
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId).select('name email role').lean();

  // The token is verified and the account was seen a moment ago, so a missing
  // user here means it was deleted mid-session.
  if (!user) {
    clearAuthCookie(res);
    throw new UnauthorizedError('authentication invalid');
  }

  res.status(StatusCodes.OK).json({
    msg: 'authenticated',
    message: 'authenticated',
    user: { name: user.name, email: user.email, role: user.role },
  });
};

// ==========================================
// POST /api/v1/auth/logout
// ==========================================
// Requires a valid session, clears the cookie, and bumps the account's session
// version so the token that was just used stops being accepted immediately
// instead of remaining valid until it expires.
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { $inc: { tokenVersion: 1 } }, { new: false })
      .select('_id')
      .lean();
  } catch (error) {
    // Even if the version bump fails, the cookie is still cleared below — the
    // user ends up logged out either way.
    console.error('⚠️  Could not invalidate session version:', error?.message || 'unknown error');
  }

  clearAuthCookie(res);

  res.status(StatusCodes.OK).json({
    msg: 'user logged out',
    message: 'user logged out',
  });
};

// ==========================================
// POST /api/v1/auth/bootstrap
// ==========================================
// One-time creation of the first admin. Permanently closed once any user exists.
export const bootstrap = async (req, res) => {
  const userExists = await User.findOne({}).select('_id').lean();
  if (userExists) {
    throw new ForbiddenError('Admin user already exists');
  }

  const name = (req.body?.name || '').trim();
  const email = (req.body?.email || '').trim().toLowerCase();

  const user = await User.create({
    name,
    email,
    // Hashed before storage, and the plaintext is never logged or echoed.
    password: await hashPassword(req.body.password),
    role: 'admin',
  });

  res.status(StatusCodes.CREATED).json({
    msg: 'admin user created successfully',
    message: 'admin user created successfully',
    user: { name: user.name, email: user.email, role: user.role },
  });
};
