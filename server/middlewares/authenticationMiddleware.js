import { UnauthorizedError } from '../errors/customErrors.js';
import { verifyJWT } from '../utils/tokenUtils.js';

// Checks for a JWT in the 'token' cookie.
// If valid, attaches { userId, role } to req.user.
// This runs on every protected route.
export const authenticateUser = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        throw new UnauthorizedError('authentication invalid');
    }

    try {
        const payload = verifyJWT(token);
        req.user = { userId: payload.userId, role: payload.role };
        next();
    } catch (error) {
        throw new UnauthorizedError('authentication invalid');
    }
};
