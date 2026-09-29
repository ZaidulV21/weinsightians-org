import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';

// Short, useful pointers. A 404 is a dead end for visitors, so give the two
// destinations people almost always want from here.
const SUGGESTIONS = [
  { label: 'Home', to: '/', description: 'Back to the start.' },
  { label: 'Services', to: '/services', description: 'What we build and how we build it.' },
  { label: 'Blog', to: '/blogs', description: 'Articles and insights.' },
  { label: 'Contact', to: '/contact', description: 'Tell us about your project.' },
];

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <>
      <Helmet>
        <title>Page not found (404) | We Insightians</title>
        <meta
          name="description"
          content="The page you were looking for is not available. Browse our services, read our blog, or get in touch with the We Insightians team."
        />
        {/* A 404 must never be indexed, but it should still pass link equity.
            No canonical and no og:url are declared: this page is served at
            whatever dead address was requested, and pointing at a different URL
            (e.g. /404, which does not exist either) would be misleading. */}
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="Page not found | We Insightians" />
        <meta
          property="og:description"
          content="The page you were looking for is not available on weinsightian.tech."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="flex min-h-screen w-full flex-col bg-white px-5 font-[gilroy] text-[#242424] md:px-10 lg:px-16">
        <section className="w-full pt-12 sm:pt-16 lg:pt-24" aria-labelledby="notfound-title">
          <p className="font-[heligthon] text-xl text-[#a380ed] sm:text-2xl">We Insightians</p>
          <h1
            id="notfound-title"
            className="mt-3 text-5xl font-[larken] leading-[1.05] tracking-tight text-[#242424] sm:text-6xl lg:text-7xl"
          >
            Page not found
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
            We could not find anything at <span className="font-semibold break-all">{pathname}</span>. The
            link may be out of date, or the address may have a typo in it.
          </p>
          <div className="mt-8 h-px w-16 bg-[#a380ed]" aria-hidden="true" />
        </section>

        <section className="w-full flex-1 py-12 sm:py-16" aria-label="Suggested pages">
          <div className="max-w-3xl">
            <h2 className="text-xl leading-snug text-[#242424] sm:text-2xl font-[larken]">
              Here is where you might want to go instead
            </h2>
            <ul className="mt-6 space-y-3 border-l-2 border-[#a380ed]/30 pl-5">
              {SUGGESTIONS.map((item) => (
                <li key={item.to} className="text-base leading-[1.8] text-gray-700 sm:text-[1.0625rem]">
                  <Link
                    to={item.to}
                    className="rounded-sm font-bold text-[#6B50A2] underline decoration-[#a380ed]/50 underline-offset-4 transition-colors duration-300 hover:text-[#4a2fa8] hover:decoration-[#a380ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a380ed] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {item.label}
                  </Link>{' '}
                  &mdash; {item.description}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-auto w-full pb-6">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default NotFound;
