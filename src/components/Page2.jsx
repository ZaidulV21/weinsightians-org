import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { services } from '../data/services';
import ServiceCard from './ServiceCard';
import GooeyBlob from './GoeyCircle';
import Button from './Button.jsx';
import { ServiceReelContext, useMediaQuery } from './serviceReelContext';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const padNumber = (value) => String(Math.max(value, 0)).padStart(2, '0');
const REEL_MASK =
  'linear-gradient(to bottom, transparent 0%, #000 15%, #000 85%, transparent 100%)';

const ReelItem = ({ progress, spot, animate, children }) => {
  const t = spot ? spot.t : 0.5;
  const w = spot ? spot.w : 0.5;
  const focusRange = [t - w, t, t + w];

  const y = useTransform(progress, focusRange, [12, 0, -12]);
  const opacity = useTransform(progress, focusRange, [0.55, 1, 0.55]);
  const scale = useTransform(progress, focusRange, [0.985, 1, 0.985]);

  return (
    <motion.div
      className="will-change-transform"
      style={animate ? { y, opacity, scale } : undefined}
    >
      {children}
    </motion.div>
  );
};

const ReelIndicator = ({ progress, activeIndex, total }) => {
  const fill = useTransform(progress, [0, 1], [0.05, 1]);

  return (
    <div
      aria-hidden="true"
      className="hidden w-7 shrink-0 flex-col items-center gap-3 pt-1 md:flex"
    >
      <span className="font-[gilroy] text-sm font-bold tabular-nums leading-none text-[#231746]">
        {padNumber(activeIndex + 1)}
      </span>
      <span className="relative w-px flex-1 overflow-hidden rounded-full bg-[#231746]/10">
        <motion.span
          className="absolute inset-0 origin-top bg-[#5a3dbd]/55"
          style={{ scaleY: fill }}
        />
      </span>
      <span className="font-[gilroy] text-[0.65rem] font-semibold tabular-nums leading-none text-[#231746]/35">
        {padNumber(total)}
      </span>
    </div>
  );
};

const Page2 = () => {
  const shouldReduceMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const reelActive = isDesktop && !shouldReduceMotion;

  const reelRef = useRef(null);
  const trackRef = useRef(null);
  const [layout, setLayout] = useState({ travel: 1, spots: [] });
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollY } = useScroll({ container: reelRef });
  const reelProgress = useTransform(scrollY, [0, layout.travel], [0, 1]);

  useEffect(() => {
    if (!isDesktop) return undefined;

    const reel = reelRef.current;
    const track = trackRef.current;
    if (!reel || !track) return undefined;

    const measure = () => {
      const reelHeight = reel.clientHeight;
      const travel = Math.max(track.scrollHeight - reelHeight, 1);
      const items = Array.from(track.children);

      const spots = items.map((item, index) => {
        const previous = items[index - 1];
        const step = previous
          ? item.offsetTop - previous.offsetTop
          : item.offsetHeight;
        const w = clamp(step / travel, 0.06, 0.2);
        const centred = (item.offsetTop - (reelHeight - item.offsetHeight) / 2) / travel;
        return { t: clamp(centred, 0, 1), w };
      });

      setLayout({ travel, spots });
    };

    measure();
    const frame = requestAnimationFrame(measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(reel);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isDesktop, services.length]);

  useMotionValueEvent(reelProgress, 'change', (value) => {
    if (!reelActive) return;

    let closest = 0;
    let closestDistance = Infinity;
    layout.spots.forEach((spot, index) => {
      const distance = Math.abs(value - spot.t);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex((current) => (current === closest ? current : closest));
  }, [layout.spots, reelActive]);

  const reel = useMemo(
    () => ({
      active: reelActive,
      activeIndex: reelActive ? activeIndex : -1,
      total: services.length,
    }),
    [reelActive, activeIndex],
  );

  return (
    <motion.div
      className='min-h-[110vh] w-full tab-page-2-main-box flex flex-col md:flex-row px-4 sm:px-8 md:px-12 lg:px-16'
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ staggerChildren: 0.3 }}
    >

      {/* Left Side */}
      <motion.div
        className='h-full w-full md:w-1/2'
        variants={{
          hidden: { opacity: 0, x: -100 },
          visible: { opacity: 1, x: 0 },
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className='w-full abt-heading h-1/3 pt-10'>
          <h1 className='font-bold font-[Gilroy] text-5xl'>About Us</h1>
          <h2 className=' abt-us-h1 mt-6 w-[35rem] font-[gilroy] text-xl'>
            Welcome to WeInsightians, a Lucknow-based web development agency. We create stunning, high-performing websites...
          </h2>
          <div className='flex gap-2 mt-5'>
            <Button href='/about' arrow className='mt-4'>
              Learn More
            </Button>
            <Button
              href='/about'
              variant='secondary'
              size='iconSm'
              className='mt-4 hover:rotate-45'
              aria-label='Learn more about us'
            >
              <img src="/right-arrow-black.png" alt="" className="h-full w-full transition-all duration-300 group-hover:invert" />
            </Button>
          </div>
        </div>

        {/* Card */}
        <div className="project-box w-[90vw] sm:w-[40vw] mt-16">
          <div className="bg-custom  tab-page-2 h-[95vh] sm:h-[70vh] md:h-[90vh]  rounded-3xl p-4">
            <div className="bg-[#e7e7e735] h-full rounded-sm relative">
              {/* Buttons */}
              <div className="absolute top-3 right-3 flex flex-col sm:flex-row gap-2">
                <Button href='/services' variant='secondary' size='sm'>
                  Our Services
                </Button>
                <Button variant='secondary' size='sm'>
                  2024
                </Button>
              </div>

              {/* Arrow Icon */}
              <div className="bg-[#1f1f1f] h-14 w-14 md:h-20 md:w-20 rounded-full relative top-10 left-3 p-4 flex items-center justify-center">
                <img src="/right-arrow.png" alt="Arrow Icon" className="w-5 h-5 md:w-7 md:h-7 transition-all duration-1000" />
              </div>

              {/* Content */}
              <div className="mt-14 sm:mt-20 pl-5">
                <h1 className="text-4xl sm:text-6xl md:text-8xl uppercase font-[gilroy] leading-tight">
                  150+ Projects Launched
                </h1>
                <h2 className="text-sm md:text-2xl font-[gilroy] mt-2">
                  Empowering our agency's growth, and with great power comes great responsibility.
                </h2>
                <Button href="/contact" arrow className="mt-6">
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side */}
      <motion.div
        className='relative flex w-full flex-col md:w-1/2'
        variants={{
          hidden: { opacity: 0, y: 28 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        >
        <ServiceReelContext.Provider value={reel}>
          <div className='flex w-full flex-1 flex-col justify-center gap-8 py-8 sm:py-10 md:py-0 lg:gap-10'>
            <div className='transforming-heading relative w-full'>
              <div className='flex items-center justify-end gap-5 font-[Gilroy] text-5xl font-bold'>
                <h1 className='uppercase'>Transforming</h1>
                <div>
                  <GooeyBlob />
                </div>
                <img className='h-10' src="/circle-design.png" alt="" />
              </div>
              <div className='mt-3 flex justify-end font-[gilroy] text-4xl font-bold uppercase'>
                <h2>ideas into visually <br /> stunning realities.</h2>
              </div>
            </div>

            <div className='flex w-full items-stretch  justify-end gap-4'>
              <div
                ref={reelRef}
                role='region'
                aria-label='Our services'
                tabIndex={reelActive ? 0 : undefined}
                style={
                  reelActive
                    ? { WebkitMaskImage: REEL_MASK, maskImage: REEL_MASK }
                    : undefined
                }
                className='service-reel relative z-10 w-full  min-w-0 rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5a3dbd]/40 md:h-[clamp(15rem,34vh,19rem)] md:overflow-x-hidden md:overflow-y-auto md:border md:border-[#231746]/[0.07] md:bg-white/70 md:p-2 lg:h-[90vh]'
              >
                <div ref={trackRef} className='relative flex  flex-col gap-4 md:gap-2.5 lg:gap-3'>
                  {services.map((service, idx) => (
                    <ReelItem
                      key={service.slug}
                      progress={reelProgress}
                      spot={layout.spots[idx]}
                      animate={reelActive}
                    >
                      <ServiceCard service={service} index={idx} />
                    </ReelItem>
                  ))}
                </div>
              </div>
              {reelActive && (
                <ReelIndicator
                  progress={reelProgress}
                  activeIndex={activeIndex}
                  total={services.length}
                />
              )}
            </div>
          </div>
        </ServiceReelContext.Provider>
      </motion.div>
    </motion.div>
  );
};

export default Page2;
