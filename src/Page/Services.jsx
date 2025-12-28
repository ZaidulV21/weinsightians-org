import React from 'react';
import { Helmet } from 'react-helmet';
import ServicePage1 from '../components/ServicePage1';
import Whatsapp from '../components/Whatsapp';

const Services = () => {
  return (<>
  <Helmet>
  <title>Our Services - We Insightians | Web Development & Branding</title>
  <meta name="description" content="Explore our expert services at We Insightians, including web development, UI/UX design, branding, and digital marketing strategies." />
  <meta name="keywords" content="Web Development, Branding, UI/UX Design, Digital Marketing, We Insightians Services" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://weinsightians.tech/services" />
  <meta property="og:title" content="Services - We Insightians | Digital Growth Solutions" />
  <meta property="og:description" content="From website design to branding and marketing, our services help your business stand out in the digital world." />
  <meta property="og:url" content="https://weinsightians.tech/services" />
  <meta property="og:type" content="website" />
</Helmet>
    <div className='h-screen bg-services'>
      
      <ServicePage1/>
    </div>
    </>
  );
};

export default Services;

