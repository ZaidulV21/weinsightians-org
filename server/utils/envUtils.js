// ==========================================
// ENVIRONMENT HELPERS
// ==========================================
// Single source of truth for "am I in production?" so cookie flags can never
// disagree between the login handler and the logout handler.

export const isProduction = () => process.env.NODE_ENV === 'production';

export const isTest = () => process.env.NODE_ENV === 'test';

// Splits a comma separated env list into trimmed, non-empty entries.
export const parseEnvList = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim().replace(/\/+$/, ''))
    .filter(Boolean);

// Verifies the required secrets are present and usable before the server starts
// accepting traffic. Returns a list of problems — it never logs or returns the
// secret values themselves.
export const getStartupConfigProblems = () => {
  const problems = [];

  if (!process.env.MONGO_URL) {
    problems.push('MONGO_URL is not set');
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret) {
    problems.push('JWT_SECRET is not set');
  } else if (isProduction() && jwtSecret.length < 32) {
    // Length only, never the value: a short secret is trivially brute forced.
    problems.push('JWT_SECRET must be at least 32 characters in production');
  }

  if (isProduction()) {
    const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter(
      (key) => !process.env[key]
    );
    if (missing.length > 0) {
      problems.push(`Missing image upload configuration: ${missing.join(', ')}`);
    }
  }

  return problems;
};
