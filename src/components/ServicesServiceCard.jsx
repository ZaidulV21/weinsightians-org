import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from './Button.jsx';

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
      id={service.slug}
      aria-labelledby={`service-${service.id}-title`}
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7 }}
      className={`group flex min-w-0 scroll-mt-24 flex-col gap-8 lg:items-center lg:gap-12 ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
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
        {/* The heading, the paragraph and the CTA used to each carry their own
            scroll-triggered reveal, on a delay that grew with the card index —
            four animations per card, thirty-six on this page, all competing for
            the same scroll. One reveal per card keeps the section transition
            and lets the content be readable the moment it arrives. */}
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-[#7c5cdd]">Service {index + 1}</span>
          <h3 id={`service-${service.id}-title`} className="mb-4 mt-2 break-words text-3xl font-bold text-gray-900 sm:text-4xl">
            {service.title}
          </h3>
        </div>

        <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
          {service.description}
        </p>

        <div className="mt-6">
          <Button to="/contact" arrow aria-label={`Get started with ${service.title}`}>
            Get Started
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default ServicesServiceCard;
