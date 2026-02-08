import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { UnauthorizedError, ForbiddenError } from '../errors/customErrors.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { attachCookiesToResponse } from '../utils/tokenUtils.js';

// POST /api/v1/auth/login
// Validates credentials and issues JWT as HTTP-only cookie
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Find the user and explicitly include password (since it's select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new UnauthorizedError('invalid credentials');
    }

    // Compare the provided password with the hashed one
    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
        throw new UnauthorizedError('invalid credentials');
    }

    // Attach JWT to HTTP-only cookie — this is how we handle auth, no Bearer tokens
    attachCookiesToResponse(res, user);

    res.status(StatusCodes.OK).json({
        msg: 'user logged in',
        user: { name: user.name, email: user.email, role: user.role },
    });
};

// POST /api/v1/auth/logout
// Clears the token cookie to log the user out
export const logout = (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out' });
};

// POST /api/v1/auth/bootstrap
// One-time route to create the first admin user
// If any user exists, this route is permanently disabled
export const bootstrap = async (req, res) => {
    // Check if any user already exists
    const userExists = await User.findOne({});
    if (userExists) {
        throw new ForbiddenError('Admin user already exists');
    }

    const { name, email, password } = req.body;

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    // Create admin user — role is always 'admin' for bootstrap
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
    });

    res.status(StatusCodes.CREATED).json({
        msg: 'admin user created successfully',
        user: { name: user.name, email: user.email, role: user.role },
    });
};
