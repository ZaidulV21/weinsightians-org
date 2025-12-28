import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import OurServices2 from './OurServices2.jsx';
import Footer from './Footer.jsx';
import PricingSection from './PricingSection.jsx';

const ServicePage1 = () => {
  return (
    <>
      {/* Section 1 */}
      <div className='h-screen px-4 md:px-16 p-5 relative overflow-hidden'>
        <Navbar />

        {/* Background Video */}

        <video
          className='video-bg absolute top-0 left-0 w-full h-full object-cover -z-10'
          src="we.mp4"
          autoPlay
          muted
          playsInline
          loop
        ></video>

        {/* Main Heading */}
        <motion.div
          className='absolute top-48'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className='text-[#efefef] text-4xl md:text-6xl font-medium font-[larken]'>
            Empowering Your Vision <br />
            with Custom Services that <br />
            Create Real Impact
          </h1>
        </motion.div>

        {/* Subheading & Badge */}
        <motion.div
          className='absolute bottom-10 flex justify-between w-[90%] md:w-[90%]'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        >
          <h1 className='font-[gilroy] text-sm md:text-base text-white'>
            WeInsightians is here for the ones who don't just follow trends, they set <br />
            them. Our services go beyond design, we're talking premium, high-impact <br />
            branding and web experiences that make your brand unforgettable.
          </h1>
          <motion.img
            className='h-20 md:h-28'
            src="/img/64bbbf416decd23360ebb88c_get-in-touch-badge.svg"
            alt="get in touch"
            loading="lazy"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      {/* Section 2 */}
      <div className='h-full  w-full px-4 md:px-16 relative'>
        <motion.div
          className='flex services-flex mt-20 md:mt-28 justify-between items-center font-[gilroy]'
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <div className='relative '>
            <h1 className='mb-5 text-zinc-500'>
              <span className='text-black'>•</span> Create gibberish history with us 
            </h1>
            <h1 className='text-4xl md:text-5xl'>
              From concept to execution our <br />
              services are designed to set you apart
            </h1>
          </div>

          <motion.div
            className='relative'
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <h1>Start your project with us today</h1>
            <div className='absolute left-0 w-10 md:w-20 h-[2px] bg-zinc-500 transition-all duration-500 hover:w-full'></div>
          </motion.div>
        </motion.div>

        <motion.div
          className='w-full mt-20 md:mt-20 h-[2px] bg-zinc-400'
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true }}
          style={{ transformOrigin: 'left' }}
        ></motion.div>

        {/* Service Cards */}
        <OurServices2 />
      <PricingSection/>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default ServicePage1;
