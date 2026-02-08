import bcrypt from 'bcryptjs';

// Hashes a plain text password using bcrypt.
// The salt rounds determine the complexity (10 is a good balance).
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

// Compares a plain text password with a hashed one.
// Returns true if they match, false otherwise.
export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
};
