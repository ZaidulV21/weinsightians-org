// ==========================================
// BACKFILL publishedAt
// ==========================================
// Optional maintenance script, safe to run more than once.
//
// Why it exists: `publishedAt` was added together with the draft/published model.
// Posts written before that have no value in the field, and the API falls back to
// `createdAt` so nothing breaks without this script. Running it makes the stored
// data honest, which matters for anything that later sorts or filters by publish
// date in the database.
//
// Usage:
//   node scripts/backfillPublishedAt.js            # reports what would change
//   node scripts/backfillPublishedAt.js --apply    # writes the missing dates
//
// It only ever fills a missing field. An existing publishedAt is never moved, so
// a post's history cannot be rewritten by running this twice.

import dns from 'dns';
import mongoose from 'mongoose';
import '../config/loadEnv.js';
import Blog, { BLOG_STATUS } from '../models/Blog.js';

// Same resolver workaround as server.js: some networks cannot look up MongoDB SRV
// records through the system resolver.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const apply = process.argv.includes('--apply');

const run = async () => {
  const problems = [];
  if (!process.env.MONGO_URL) problems.push('MONGO_URL is not set');
  if (!process.env.JWT_SECRET) problems.push('JWT_SECRET is not set');
  if (problems.length > 0) {
    console.error('❌ Missing configuration:');
    problems.forEach((problem) => console.error(`   - ${problem}`));
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected to MongoDB');

  // Everything that is publicly visible but has no date recorded yet.
  const filter = {
    publishedAt: { $exists: false },
    $or: [{ status: BLOG_STATUS.PUBLISHED }, { status: { $exists: false } }],
  };

  const candidates = await Blog.find(filter)
    .select('_id title slug createdAt status')
    .sort({ createdAt: 1 })
    .lean();

  if (candidates.length === 0) {
    console.log('✅ Nothing to backfill.');
    return;
  }

  console.log(`Found ${candidates.length} post(s) without a publish date:`);
  candidates.forEach((blog) => {
    console.log(`   - ${blog.slug} (created ${blog.createdAt?.toISOString?.() || 'unknown'})`);
  });

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to write these dates.');
    return;
  }

  const operations = candidates.map((blog) => ({
    updateOne: {
      filter: { _id: blog._id, publishedAt: { $exists: false } },
      update: { $set: { publishedAt: blog.createdAt } },
    },
  }));

  const result = await Blog.bulkWrite(operations, { ordered: false });
  console.log(
    `✅ Backfilled ${result.modifiedCount} post(s). ${
      result.matchedCount - result.modifiedCount
    } already had a date.`
  );
};

run()
  .catch((error) => {
    console.error('❌ Backfill failed:', error?.message || 'unknown error');
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
