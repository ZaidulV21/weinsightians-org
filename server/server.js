// ==========================================
// SERVER ENTRY POINT
// ==========================================
// Configuration is validated before anything starts listening, so a missing or
// weak secret is a startup failure instead of a runtime surprise. Only the
// problem is reported — never a secret value.

import dns from 'dns';
import mongoose from 'mongoose';

// Must stay first: this is what populates process.env from server/.env before any
// other module is evaluated. See config/loadEnv.js.
import './config/loadEnv.js';
import app from './app.js';
import { getStartupConfigProblems } from './utils/envUtils.js';

// Some networks cannot resolve MongoDB SRV records through the system resolver.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 6200;

const startServer = async () => {
  const problems = getStartupConfigProblems();
  if (problems.length > 0) {
    console.error('❌ Invalid server configuration:');
    problems.forEach((problem) => console.error(`   - ${problem}`));
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
