// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
// This is the security boundary. The React <ProtectedRoute> only decides what the
// admin UI paints; every write below depends on this middleware instead.
//
// A token is only accepted when all of the following hold:
//   1. it arrives in the auth cookie (never from a header, never from the body),
//   2. it verifies against JWT_SECRET and has not expired,
//   3. the account still exists,
//   4. its session version matches the account's current version, so a logout
//      invalidates tokens that are still cryptographically valid.

import mongoose from 'mongoose';
import User from '../models/User.js';
import { UnauthorizedError } from '../errors/customErrors.js';
import { getAuthTokenFromCookies, verifyJWT } from '../utils/tokenUtils.js';

const reject = () => new UnauthorizedError('authentication invalid');

export const authenticateUser = async (req, res, next) => {
  try {
    const token = getAuthTokenFromCookies(req);
    if (!token) throw reject();

    const payload = verifyJWT(token);

    // The id from the token is a claim, not a trusted value: it is parsed here
    // so a tampered token cannot reach Mongoose with a non-ObjectId string.
    if (!payload?.userId || !mongoose.Types.ObjectId.isValid(String(payload.userId))) {
      throw reject();
    }

    // The role is read from the database, not from the token, so a role change
    // takes effect immediately instead of waiting for the token to expire.
    const user = await User.findById(String(payload.userId))
      .select('role tokenVersion')
      .lean();

    if (!user) throw reject();

    const tokenVersion = Number(payload.tokenVersion ?? 0);
    if (tokenVersion !== Number(user.tokenVersion ?? 0)) throw reject();

    req.user = {
      userId: String(user._id),
      role: user.role,
      tokenVersion,
    };

    return next();
  } catch (error) {
    // A bad cookie is a client problem, never a server fault, and the reason is
    // deliberately identical in every case so it cannot be used as an oracle.
    return next(reject());
  }
};

export default authenticateUser;
