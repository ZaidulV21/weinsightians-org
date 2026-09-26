import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service, index }) => {
  const shouldReduceMotion = useReducedMotion();
  const serviceNumber = String(index + 1).padStart(2, '0');
  const summary = service.description.split('. ')[0];

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : Math.min(index * 0.05, 0.3) }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className="group min-w-0"
    >
      <Link
        to={`/services#${service.slug}`}
        className="flex items-start gap-3 rounded-2xl bg-[#d0e3ff86] px-4 py-4 shadow-md transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#c3dbff99] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-2 motion-reduce:transform-none sm:gap-4 sm:px-5"
      >
        <span className="w-7 shrink-0 font-[gilroy] text-sm font-bold tabular-nums text-[#231746]/60 sm:w-8">{serviceNumber}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="font-[gilroy] text-lg font-bold leading-tight text-[#110e1a] transition-colors duration-300 group-hover:text-[#5a3dbd] sm:text-xl">
              {service.title}
            </span>
            <span
              aria-hidden="true"
              className="shrink-0 font-[gilroy] text-xl leading-none text-[#110e1a] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </span>
          <span className="mt-1 line-clamp-2 font-[gilroy] text-sm leading-relaxed text-[#231746]/80 sm:text-base">{summary}</span>
        </span>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
