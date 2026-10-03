// ==========================================
// GET /api/v1/sitemap.xml — PUBLIC
// ==========================================
// Read-only, unauthenticated, and generated per request from MongoDB. There is no
// build step and no file to remember to update: the response reflects the
// published blog records as they are at the moment of the request.
//
// If the query fails, nothing is written to the response. The error propagates to
// the central error handler, which returns a plain 503 with a generic message —
// never a Mongo error, never a connection string, and never a sitemap assembled
// from partial or invented data, which would be worse than an error because a
// crawler cannot tell the difference.

import { StatusCodes } from 'http-status-codes';
import Blog, { publishedFilter } from '../models/Blog.js';
import { renderSitemap } from '../utils/sitemapUtils.js';

// Only what the document needs. content, description, author and image are large
// and none of them is ever emitted, so they are never read from disk. `status` is
// included so the renderer can re-check visibility independently of the query.
const SITEMAP_FIELDS = 'slug status updatedAt publishedAt createdAt';

// Short enough that a post published a moment ago is discoverable quickly, long
// enough that a crawler sweep does not turn into one query per URL. No
// s-maxage/Stale-While-Revalidate: there is no CDN in front of this service that
// has been verified to honour them.
const CACHE_CONTROL = 'public, max-age=300';

export const getSitemap = async (req, res) => {
  // publishedFilter(), not `status: 'published'`: posts written before the status
  // field existed are public too, and filtering on the enum alone would silently
  // drop them from the sitemap while they remain reachable at /blog/<slug>.
  const blogs = await Blog.find(publishedFilter()).select(SITEMAP_FIELDS).lean();

  const xml = renderSitemap(blogs);

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', CACHE_CONTROL);
  res.status(StatusCodes.OK).send(xml);
};

export default getSitemap;