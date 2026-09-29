import { Helmet } from 'react-helmet-async';

/**
 * Wraps private/admin screens so search engines are told to stay out.
 *
 * This is a crawl hint, not access control — /admin/ is already Disallowed in
 * robots.txt, and the real boundary is the JWT session the API enforces on
 * every write. Admin pages ship no content a crawler should keep, so the meta
 * robots tag is the correct tool here.
 */
const NoIndex = ({ children }) => (
  <>
    <Helmet>
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <meta name="googlebot" content="noindex, nofollow, noarchive" />
    </Helmet>
    {children}
  </>
);

export default NoIndex;
