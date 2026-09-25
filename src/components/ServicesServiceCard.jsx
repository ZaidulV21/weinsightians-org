import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ServicesServiceCard = ({ service, index }) => {
  const shouldReduceMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const isReversed = index % 2 !== 0;

  useEffect(() => {
    setImageFailed(false);
  }, [service.image]);
  const initial = shouldReduceMotion ? false : { opacity: 0, y: 40 };

  return (
    <motion.article
      id={`service-${service.id}`}
      aria-labelledby={`service-${service.id}-title`}
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : index * 0.1 }}
      className={`group flex min-w-0 flex-col gap-8 lg:items-center lg:gap-12 ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
    >
      <div className={`min-w-0 flex-1 overflow-hidden rounded-2xl bg-zinc-100 ${imageFailed ? 'aspect-[4/3]' : ''}`}>
        <img
          src={service.image}
          alt={`${service.title} service illustration`}
          loading="lazy"
          decoding="async"
          className={`aspect-[4/3] h-auto max-h-[28rem] w-full object-cover transition-transform duration-700 ease-out motion-reduce:transform-none group-hover:scale-105 motion-reduce:transition-none ${imageFailed ? 'hidden' : ''}`}
          onError={() => setImageFailed(true)}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-6">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.15 + index * 0.1 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-[#7c5cdd]">Service {index + 1}</span>
          <h3 id={`service-${service.id}-title`} className="mb-4 mt-2 break-words text-3xl font-bold text-gray-900 sm:text-4xl">
            {service.title}
          </h3>
        </motion.div>

        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.3 + index * 0.1 }}
          className="text-base leading-relaxed text-gray-600 sm:text-lg"
        >
          {service.description}
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.45 + index * 0.1 }}
          className="mt-6"
        >
          <Link
            to="/contact"
            aria-label={`Get started with ${service.title}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#7c5cdd] px-8 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:bg-[#5a3dbd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </motion.article>
  );
};

export default ServicesServiceCard;
