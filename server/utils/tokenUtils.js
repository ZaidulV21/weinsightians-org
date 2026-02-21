import jwt from 'jsonwebtoken';

// Creates a JWT with userId and role embedded in the payload.
// We keep the payload minimal — only what's needed for auth decisions.
export const createJWT = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
};

// Verifies and decodes the token.
// Throws an error if the token is invalid or expired.
export const verifyJWT = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};

// Attaches JWT as an HTTP-only cookie — this is the only way we store tokens.
// maxAge is set to match the JWT expiry (1 day = 86400000 ms).
// export const attachCookiesToResponse = (res, user) => {
//     const token = createJWT({ userId: user._id, role: user.role });

//     const oneDay = 1000 * 60 * 60 * 24;

//     res.cookie('token', token, {
//         httpOnly: true,
//         expires: new Date(Date.now() + oneDay),
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: ,
//     });
// };
export const attachCookiesToResponse = (res, user) => {
    const token = createJWT({ userId: user._id, role: user.role });

    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production', // required for HTTPS
        sameSite: 'None',  // required for cross-origin cookies
    });
};