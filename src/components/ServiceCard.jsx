import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useServiceReel } from './serviceReelContext';

const ServiceCard = ({ service, index }) => {
  const shouldReduceMotion = useReducedMotion();
  const reel = useServiceReel();
  const inReel = Boolean(reel && reel.active);
  const isActive = inReel && reel.activeIndex === index;
  const serviceNumber = String(index + 1).padStart(2, '0');
  const summary = service.description.split('. ')[0];

  return (
    <motion.div
      initial={shouldReduceMotion || inReel ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion || inReel ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay:
          shouldReduceMotion || inReel ? 0 : Math.min(index * 0.05, 0.3),
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      className="group min-w-0"
    >
      <Link
        to={`/services#${service.slug}`}
        data-active={isActive ? 'true' : undefined}
        className="flex items-start gap-4 rounded-[1.5rem] border border-[#231746]/[0.07] bg-white/85 px-5 py-5 shadow-[0_1px_2px_rgba(35,23,70,0.04),0_18px_40px_-32px_rgba(35,23,70,0.55)] backdrop-blur-md transition-[background-color,border-color,box-shadow,transform] duration-500 hover:border-[#5a3dbd]/25 hover:bg-white hover:shadow-[0_1px_2px_rgba(35,23,70,0.05),0_26px_50px_-32px_rgba(35,23,70,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#231746]/5 motion-reduce:transform-none data-[active=true]:border-[#5a3dbd]/20 data-[active=true]:bg-white data-[active=true]:shadow-[0_1px_2px_rgba(35,23,70,0.05),0_30px_60px_-34px_rgba(35,23,70,0.75)] sm:gap-5 sm:px-6 sm:py-6"
      >
        <span className="mt-1 w-8 shrink-0 font-[gilroy] text-xs font-bold tabular-nums tracking-[0.18em] text-[#5a3dbd]/55 sm:w-9">
          {serviceNumber}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-4">
            <span className="font-[gilroy] text-xl font-bold leading-[1.15] tracking-[-0.01em] text-[#110e1a] transition-colors duration-500 group-hover:text-[#4b2ba8] group-data-[active=true]:text-[#2c1c5c] sm:text-2xl">
              {service.title}
            </span>
            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 font-[gilroy] text-lg leading-none text-[#5a3dbd]/50 transition-[color,transform] duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#4b2ba8]"
            >
              ↗
            </span>
          </span>
          <span className="mt-2 line-clamp-2 font-[gilroy] text-sm leading-relaxed text-[#231746]/60 sm:text-[0.95rem]">
            {summary}
          </span>
        </span>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
