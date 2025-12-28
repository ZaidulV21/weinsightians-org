import React from 'react';
import { Helmet } from 'react-helmet';
import Page1 from "../components/Page1"
import Page2 from "../components/Page2"
import Page3 from "../components/Page3"
import Page4 from "../components/Page4"
import Page5 from "../components/Page5"
import Footer from "../components/Footer"
import Whatsapp from '../components/Whatsapp';
import PricingPlans from '../components/PricingSection';

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>We Insightians - Expert Web Development & Branding</title>
        <meta name="description" content="We Insightians provides top-tier web development, UI/UX design, and digital solutions to grow your business." />
        <meta name="keywords" content="We Insightians, Web Development, Branding, Digital Solutions, UI/UX Design" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://weinsightians.tech/" />
        <meta property="og:title" content="We Insightians - Bringing Your Vision to Life" />
        <meta property="og:description" content="We Insightians is a leading digital agency specializing in branding, website design, and business growth strategies." />
        <meta property="og:url" content="https://weinsightians.tech/" />
        <meta property="og:type" content="website" />
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

