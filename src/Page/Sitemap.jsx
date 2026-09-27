import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';

/* Every entry below points at a route that exists in App.jsx, or at a
 * section id that exists in the markup. Nothing here is aspirational. */
const SITEMAP_GROUPS = [
  {
    id: 'main',
    title: 'Main',
    description: 'The primary pages of the We Insightians website.',
    links: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Services', to: '/services' },
      { label: 'Blog', to: '/blogs' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    id: 'services',
    title: 'Services',
    description: 'The capabilities we offer, all covered on our services page.',
    links: [
      { label: 'Web Design', to: '/services#services' },
      { label: 'Web Development', to: '/services#services' },
      { label: 'E-commerce Development', to: '/services#services' },
      { label: 'UI/UX Design', to: '/services#services' },
      { label: 'SEO & Digital Marketing', to: '/services#services' },
      { label: 'AI Solutions', to: '/services#services' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    description: 'Policies and pages that describe how we work.',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
];

const Sitemap = () => {
  return (
    <>
      <Helmet>
        <title>Sitemap | We Insightians</title>
        <meta
          name="description"
          content="Browse every live page on the We Insightians website: our services, about page, blog, contact details, and legal pages."
        />
        <meta name="keywords" content="Sitemap, We Insightians, We Insightians Pages, Website Structure" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://weinsightian.tech/sitemap" />
        <meta property="og:title" content="Sitemap - We Insightians" />
        <meta
          property="og:description"
          content="Explore the pages, services, and resources available across We Insightians."
        />
        <meta property="og:url" content="https://weinsightian.tech/sitemap" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="flex min-h-screen w-full flex-col bg-white px-5 font-[gilroy] text-[#242424] md:px-10 lg:px-16">
        <section className="w-full pt-12 sm:pt-16 lg:pt-24" aria-labelledby="sitemap-title">
          <p className="font-[heligthon] text-xl text-[#a380ed] sm:text-2xl">We Insightians</p>
          <h1
            id="sitemap-title"
            className="mt-3 text-5xl font-[larken] leading-[1.05] tracking-tight text-[#242424] sm:text-6xl lg:text-7xl"
          >
            Sitemap
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
            Explore the pages, services, and resources available across We Insightians.
          </p>
          <div className="mt-8 h-px w-16 bg-[#a380ed]" aria-hidden="true" />
        </section>

        <section className="w-full flex-1 py-12 sm:py-16" aria-label="All pages on this website">
          <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SITEMAP_GROUPS.map((group) => (
              <nav key={group.id} aria-labelledby={`sitemap-${group.id}`} className="min-w-0">
                <h2
                  id={`sitemap-${group.id}`}
                  className="text-xl font-[larken] text-[#242424] sm:text-2xl"
                >
                  {group.title}
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-600">{group.description}</p>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-2 rounded-sm text-base text-gray-700 underline decoration-[#a380ed]/40 underline-offset-4 transition-colors duration-300 hover:text-[#6B50A2] hover:decoration-[#a380ed] focus-visible:text-[#6B50A2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a380ed] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="text-[#a380ed] transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </section>

        <div className="mt-auto w-full pb-6">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Sitemap;
