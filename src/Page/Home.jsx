import React from 'react';
import { Helmet } from 'react-helmet-async';
import Page1 from "../components/Page1"
import Page2 from "../components/Page2"
import Page3 from "../components/Page3"
import Page4 from "../components/Page4"
import Page5 from "../components/Page5"
import Footer from "../components/Footer"
import Whatsapp from '../components/Whatsapp';
import PricingPlans from '../components/PricingSection';

/* noindex is opt-in so the legacy /home duplicate can reuse this component
 * without overriding its robots tag. Relying on <Helmet> nesting order is
 * fragile: whichever <Helmet> mounts last wins, and Home's own tag is a child. */
const Home = ({ noindex = false }) => {
  return (
    <div>
      <Helmet>
        <title>We Insightians | Web Design, Development &amp; Digital Solutions</title>
        <meta
          name="description"
          content="We Insightians is a digital agency in Lucknow building websites, brands and digital products. Web design, development, UI/UX, SEO and marketing under one roof."
        />
        <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
        <link rel="canonical" href="https://weinsightian.tech/" />
        <meta property="og:title" content="We Insightians | Web Design, Development &amp; Digital Solutions" />
        <meta
          property="og:description"
          content="We design and build digital experiences that help ambitious businesses look better, perform better and grow."
        />
        <meta property="og:url" content="https://weinsightian.tech/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="We Insightians" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="We Insightians | Web Design, Development &amp; Digital Solutions" />
        <meta
          name="twitter:description"
          content="We design and build digital experiences that help ambitious businesses look better, perform better and grow."
        />
      </Helmet>
    <div className='overflow-hidden'>
      <Whatsapp/>
      <Page1/>
      <Page2/>
      <Page3/>
      <PricingPlans/>
      <Page4/>
      <Page5/>
      <div className='px-4 md:px-16'>
        <Footer/>
        </div>
        </div>
    </div>
  );
};

export default Home;

