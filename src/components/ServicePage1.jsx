import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import OurServices2 from './OurServices2.jsx';
import Footer from './Footer.jsx';
import PricingSection from './PricingSection.jsx';

const ServicePage1 = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-services">
      <section
        aria-labelledby="services-hero-title"
        className="relative isolate flex min-h-[clamp(34rem,100svh,48rem)] w-full flex-col justify-between overflow-hidden px-4 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20"
      >
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          src="/we.mp4"
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          aria-hidden="true"
          tabIndex="-1"
        ></video>

        <motion.div
          className="relative z-10 max-w-5xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 id="services-hero-title" className="max-w-5xl text-4xl font-medium leading-tight text-[#efefef] sm:text-5xl lg:text-6xl font-[larken]">
            Empowering Your Vision with Custom Services that Create Real Impact
          </h1>
        </motion.div>

        <motion.div
          className="relative z-10 mt-12 flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' }}
        >
          <p className="max-w-2xl text-sm leading-relaxed text-white sm:text-base font-[gilroy]">
            WeInsightians is here for the ones who don't just follow trends, they set them. Our services bring strategy, design, technology, and growth together to help ambitious brands build a stronger digital presence.
          </p>
          <motion.img
            className="h-16 w-auto max-w-[8rem] shrink-0 sm:h-20 lg:h-28"
            src="/img/64bbbf416decd23360ebb88c_get-in-touch-badge.svg"
            alt="Get in touch"
            initial={shouldReduceMotion ? false : { rotate: 0 }}
            animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 18, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </section>

      <section aria-labelledby="services-intro-title" className="w-full px-4 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="min-w-0 md:max-w-3xl">
              <p className="mb-5 text-zinc-500">
                <span aria-hidden="true" className="text-black">•</span> Strategy, design, technology, and growth
              </p>
              <h2 id="services-intro-title" className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
                From first idea to lasting growth, our services cover the full digital journey
              </h2>
            </div>

            <div className="shrink-0">
              <Link
                to="/contact"
                className="group inline-flex min-h-11 items-center text-left text-base font-[gilroy] transition-colors hover:text-[#7c5cdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-4 sm:text-lg"
              >
                <span>Start your project with us today</span>
                <span aria-hidden="true" className="ml-4 block h-px w-10 bg-zinc-500 transition-all duration-500 group-hover:w-20 group-focus-visible:w-20"></span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="mt-16 h-px w-full origin-left bg-zinc-400"
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          ></motion.div>
        </div>
      </section>

      <OurServices2 />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default ServicePage1;
