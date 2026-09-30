// Shared test setup: deterministic environment, and never a real database.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-value-that-is-long-enough-for-tests-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGO_URL = 'mongodb://127.0.0.1:27017/never-used-in-these-tests';

// Cloudinary is deliberately left unconfigured. With credentials present the
// controller would try a real upload over the network on every image test; without
// them it stops with a clean message before the network is touched.
delete process.env.CLOUDINARY_CLOUD_NAME;
delete process.env.CLOUDINARY_API_KEY;
delete process.env.CLOUDINARY_API_SECRET;
