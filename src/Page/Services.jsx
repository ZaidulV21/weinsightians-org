import React from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer.jsx';
import ServicePage1 from '../components/ServicePage1';

const Services = () => {
  return (
    <>
      <Helmet>
        <title>Web Design &amp; Development Services | We Insightians</title>
        <meta
          name="description"
          content="Nine services from one team: web design, web development, e-commerce, UI/UX, branding, SEO, social media, AI and performance marketing. See what each one includes."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://weinsightian.tech/services" />
        <meta property="og:title" content="Web Design &amp; Development Services | We Insightians" />
        <meta
          property="og:description"
          content="From first idea to lasting growth, our services cover the full digital journey — design, technology and marketing together."
        />
        <meta property="og:url" content="https://weinsightian.tech/services" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="We Insightians" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <ServicePage1 />
      <div className='px-10'>
      <Footer/>
      </div>
    </>
  );
};

export default Services;
