import { ForbiddenError } from '../errors/customErrors.js';

// The system has exactly one role ('admin'), so this is a single check rather
// than a role hierarchy — no roles are invented. It runs only after
// authenticateUser, and still defends itself if the chain is ever reordered.
const adminRouteMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('not authorized to access this route'));
  }
  return next();
};

export default adminRouteMiddleware;
