import { Router } from 'express';
import { getSitemap } from '../controllers/sitemapController.js';

const router = Router();

// ==========================================
// PUBLIC — no authentication
// ==========================================
// Crawlers arrive with no cookie, no session and no Origin header, so this route
// must never sit behind authenticateUser. It exposes nothing that is not already
// public: the published slugs, which are reachable at /blog/<slug> by anyone.
//
// Reads only. There is no POST, PUT, PATCH or DELETE on this router.
router.get('/sitemap.xml', getSitemap);

export default router;