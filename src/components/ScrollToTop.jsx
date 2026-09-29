import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Route-level scroll behaviour.
 *
 * - A pathname change resets the window to the top, so landing on /about from
 *   a scrolled Home never inherits Home's offset.
 * - A hash with a live target is honoured instead of being overwritten, which
 *   keeps /services#web-development, /services#seo, /contact#faq and the
 *   Sitemap page's section links working.
 * - Hash-only changes (same page, new anchor) are also resolved, so a footer
 *   link such as /contact#faq still scrolls when you are already on /contact.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const pathChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;

    if (!hash) {
      if (pathChanged) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      return undefined;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    const target = targetId ? document.getElementById(targetId) : null;

    if (!target) {
      if (pathChanged) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      return undefined;
    }

    // Let the destination page finish laying out before we move the viewport.
    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
