import { Helmet } from 'react-helmet-async';

/**
 * Foundational site-level structured data: Organization + WebSite.
 *
 * Every value below is copied from content that already exists in this repo
 * (About page, Contact page, Privacy page, public/ assets). Nothing is
 * inferred: no ratings, no awards, no review markup, no invented addresses or
 * phone numbers.
 *
 * Per-article BlogPosting markup is deliberately NOT here. This component renders
 * on every route and has no access to article data, so a post's own node is
 * emitted by the article page instead — see `articleStructuredData()` in
 * src/utils/article.js. That node references this Organization and WebSite by
 * @id rather than declaring its own, so the two never conflict.
 */

const ORIGIN = 'https://weinsightian.tech';

const ORGANIZATION_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;

const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'We Insightians',
      url: `${ORIGIN}/`,
      description:
        'We Insightians is a digital agency in Lucknow that designs and builds websites, brands and digital products for businesses that want to grow online.',
      logo: {
        '@type': 'ImageObject',
        '@id': `${ORIGIN}/#logo`,
        url: `${ORIGIN}/img/web-app-manifest-512x512.png`,
        contentUrl: `${ORIGIN}/img/web-app-manifest-512x512.png`,
        width: 512,
        height: 512,
        caption: 'We Insightians',
      },
      image: { '@id': `${ORIGIN}/#logo` },
      email: 'support@weinsightian.tech',
      telephone: '+91-73099-75088',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Matiyari',
        addressLocality: 'Lucknow',
        addressRegion: 'Uttar Pradesh',
        postalCode: '226028',
        addressCountry: 'IN',
      },
      sameAs: [
        'https://www.instagram.com/weinsightians',
        'https://www.linkedin.com/company/we-insightians/',
        'https://www.facebook.com/profile.php?id=61552381883595',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${ORIGIN}/`,
      name: 'We Insightians',
      description:
        'Website of We Insightians, a digital agency offering web design, web development, UI/UX, branding, SEO and digital marketing services.',
      inLanguage: 'en',
      publisher: { '@id': ORGANIZATION_ID },
    },
  ],
};

const StructuredData = () => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(graph)}</script>
  </Helmet>
);

export default StructuredData;
