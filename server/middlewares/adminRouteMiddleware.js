import { ForbiddenError } from '../errors/customErrors.js';

// Checks if the user has admin role.
// This is a simple, purpose-built middleware for admin-only routes.
// We could make it more generic (accept roles array), but keeping it simple for now.
const adminRouteMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new ForbiddenError('not authorized to access this route');
    }
    next();
};

export default adminRouteMiddleware;
