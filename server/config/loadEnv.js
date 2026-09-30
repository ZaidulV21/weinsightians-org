// ==========================================
// ENVIRONMENT
// ==========================================
// Loaded exactly once, as the first import of server.js. ES module imports are
// evaluated in order, so by the time app.js (and everything it pulls in) is
// evaluated, process.env already contains the values from server/.env.
//
// No other module calls dotenv itself. That is what keeps a library module from
// depending on import order, and what stops the real credentials on this machine
// from leaking into a test run.

import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export default process.env;
