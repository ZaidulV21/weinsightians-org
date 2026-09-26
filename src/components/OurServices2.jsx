import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { services } from '../data/services';
import ServicesServiceCard from './ServicesServiceCard.jsx';

const OurServices2 = () => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();

  useEffect(() => {
    const targetId = decodeURIComponent(location.hash.slice(1));
    if (!targetId) return undefined;

    const frame = requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'start' });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.hash, shouldReduceMotion]);

  return (
    <section id="services" aria-labelledby="services-heading" className="w-full overflow-x-clip bg-gradient-to-b px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-7xl">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 id="services-heading" className="inline-block border-b-2 border-gray-400 pb-3 text-4xl font-bold text-gray-900 sm:text-5xl font-[larken]">Our Services</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
            Nine specialised services for strategy, design, technology, and growth
          </p>
        </motion.div>

        <ul className="m-0 list-none space-y-20 p-0 sm:space-y-24">
          {services.map((service, index) => (
            <li key={service.id} className="min-w-0">
              <ServicesServiceCard service={service} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default OurServices2;
