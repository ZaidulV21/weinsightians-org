import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import OurServices2 from './OurServices2.jsx';
import Footer from './Footer.jsx';
import PricingSection from './PricingSection.jsx';
import Button from './Button.jsx';

const HERO_GRID = {
  backgroundImage:
    'linear-gradient(to right, rgba(35, 23, 70, 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(35, 23, 70, 0.055) 1px, transparent 1px)',
  backgroundSize: '64px 64px',
};

const HERO_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E\")";

const HERO_NODES = [
  { id: 'design', label: 'Design', glyph: 'crosshair', spot: 'left-0 top-[9%]', point: '17,20', lift: 8, duration: 7.5, delay: 0.1, tilt: 'rotate-3' },
  { id: 'development', label: 'Development', glyph: 'code', spot: 'right-0 top-[5%]', point: '83,16', lift: 10, duration: 8.5, delay: 0.9, tilt: '-rotate-3' },
  { id: 'branding', label: 'Branding', glyph: 'diamond', spot: 'right-[2%] top-[43%]', point: '89,52', lift: 7, duration: 7, delay: 0.4, tilt: 'rotate-2' },
  { id: 'growth', label: 'Growth', glyph: 'trend', spot: 'right-[7%] bottom-[5%]', point: '77,87', lift: 9, duration: 9, delay: 1.3, tilt: '-rotate-2' },
  { id: 'ai', label: 'AI', glyph: 'chip', spot: 'left-[2%] bottom-[9%]', point: '20,82', lift: 8, duration: 8, delay: 0.6, tilt: 'rotate-3' },
];

const floatLoop = (lift, duration, delay) => ({
  y: [0, -lift, 0],
  transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
});

const HeroGlyph = ({ name, className = '' }) => {
  const shared = {
    className: `h-4 w-4 ${className}`,
    viewBox: '0 0 12 12',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.1,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  const shapes = {
    crosshair: (
      <>
        <circle cx="6" cy="6" r="3.5" />
        <path d="M6 1.4v1.9M6 8.7v1.9M1.4 6h1.9M8.7 6h1.9" />
      </>
    ),
    code: <path d="M4.6 3.4 2.2 6l2.4 2.6M7.4 3.4 9.8 6l-2.4 2.6" />,
    diamond: <path d="M6 1.6 10.4 6 6 10.4 1.6 6Z" />,
    trend: (
      <>
        <path d="M2.2 9.4 5.2 6.2l2.1 2.1L9.8 4" />
        <path d="M7.3 4h2.5v2.5" />
      </>
    ),
    chip: (
      <>
        <rect x="3.1" y="3.1" width="5.8" height="5.8" rx="1.2" />
        <path d="M5 1.5v1.6M7 1.5v1.6M5 8.9v1.6M7 8.9v1.6M1.5 5h1.6M1.5 7h1.6M8.9 5h1.6M8.9 7h1.6" />
      </>
    ),
  };

  return <svg {...shared}>{shapes[name]}</svg>;
};

const HeroCenterpiece = ({ shouldReduceMotion }) => {
  const still = shouldReduceMotion;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[21rem] sm:max-w-[26rem] lg:max-w-[32rem]">
      <div aria-hidden="true" className="absolute inset-[7%] rounded-full border border-dashed border-[#a380ed]/25" />
      <div aria-hidden="true" className="absolute inset-[22%] rounded-full border border-[#4f8bff]/20" />

      <motion.div
        aria-hidden="true"
        className="absolute inset-[7%] rounded-full border border-dashed border-[#7c5cdd]/35"
        animate={still ? {} : { rotate: 360, transition: { duration: 90, repeat: Infinity, ease: 'linear' } }}
      />

      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
        {HERO_NODES.map((node) => (
          <path
            key={node.id}
            d={`M50 50 L${node.point.split(',')[0]} ${node.point.split(',')[1]}`}
            stroke="rgba(90, 61, 189, 0.26)"
            strokeWidth="0.35"
            strokeDasharray="1.4 2.4"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <motion.div
        className="absolute left-1/2 top-1/2 w-28 -translate-x-1/2 -translate-y-1/2 sm:w-36"
        animate={still ? {} : floatLoop(7, 7.5, 0.2)}
      >
        <div className="relative aspect-square rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-[#a380ed]/45 via-[#7c5cdd]/25 to-[#4f8bff]/40 shadow-[0_34px_70px_-28px_rgba(35,23,70,0.55)] backdrop-blur-md sm:rounded-[1.9rem]">
          <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 place-items-center rounded-[inherit] p-5">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${index === 4 ? 'bg-[#67e8f9]' : 'bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {HERO_NODES.map((node) => (
        <motion.div
          key={node.id}
          className={`absolute ${node.spot} flex flex-col items-center gap-2`}
          animate={still ? {} : floatLoop(node.lift, node.duration, node.delay)}
        >
          <span
            className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/80 bg-white/75 text-[#5a3dbd] shadow-[0_16px_40px_-16px_rgba(35,23,70,0.45)] backdrop-blur-md sm:h-14 sm:w-14 ${node.tilt}`}
          >
            <HeroGlyph name={node.glyph} />
          </span>
          <span className="font-[gilroy] text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {node.label}
          </span>
        </motion.div>
      ))}

      <motion.div
        aria-hidden="true"
        className="absolute right-[16%] top-[30%] hidden rounded-lg border border-black/5 bg-white/70 px-2 py-1.5 shadow-[0_10px_30px_-14px_rgba(35,23,70,0.4)] backdrop-blur-md sm:block"
        animate={still ? {} : floatLoop(11, 9.5, 0.5)}
      >
        <span className="flex items-center gap-1">
          <i className="h-1.5 w-1.5 rounded-full bg-[#a380ed]" />
          <i className="h-1.5 w-1.5 rounded-full bg-[#4f8bff]" />
          <i className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
        </span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[18%] left-[8%] hidden h-12 w-16 items-end gap-1.5 rounded-xl border border-black/5 bg-white/70 px-2.5 py-2 shadow-[0_10px_30px_-14px_rgba(35,23,70,0.4)] backdrop-blur-md sm:flex"
        animate={still ? {} : floatLoop(9, 10.5, 1.6)}
      >
        <i className="h-3 w-1.5 rounded-sm bg-[#a380ed]/70" />
        <i className="h-6 w-1.5 rounded-sm bg-[#4f8bff]/70" />
        <i className="h-4 w-1.5 rounded-sm bg-[#67e8f9]/70" />
      </motion.div>
    </div>
  );
};

const ServicePage1 = () => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToServices = (event) => {
    const target = document.getElementById('services');
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="w-full bg-services">
      <section
        aria-labelledby="services-hero-title"
        className="relative isolate flex min-h-[clamp(38rem,94svh,54rem)] w-full flex-col justify-center overflow-hidden bg-white px-4 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16 lg:px-16 lg:pb-24 lg:pt-20 lg:-mt-9"
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[12%] opacity-90"
          style={HERO_GRID}
          animate={shouldReduceMotion ? {} : { x: ['0%', '2.2%'], y: ['0%', '1.6%'], transition: { duration: 26, repeat: Infinity, ease: 'linear' } }}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[12rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(163,128,237,0.30),transparent_62%)] blur-3xl"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75], transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' } }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10rem] bottom-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(79,139,255,0.24),transparent_64%)] blur-3xl"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7], transition: { duration: 22, repeat: Infinity, ease: 'easeInOut' } }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply"
          style={{ backgroundImage: HERO_NOISE }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center">
          <div className="grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <motion.div
                className="flex items-center gap-3"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#a380ed]" />
                <span className="font-[gilroy] text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:text-[11px]">
                  We Insightians — Services
                </span>
              </motion.div>

              <h1
                id="services-hero-title"
                className="mt-6 max-w-[15ch] font-[larken] text-[2.5rem] leading-[1.02] tracking-[-0.02em] text-[#171126] sm:mt-8 sm:text-6xl lg:text-7xl"
              >
                {['Services that turn', 'ideas into '].map((line, index) => (
                  <span key={line} className="block overflow-hidden pb-[0.06em]">
                    <motion.span
                      className="block"
                      initial={shouldReduceMotion ? false : { y: '108%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, delay: shouldReduceMotion ? 0 : 0.12 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
                <span className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block text-[#5a3dbd]"
                    initial={shouldReduceMotion ? false : { y: '108%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: shouldReduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    impact.
                  </motion.span>
                </span>
              </h1>

              <motion.p
                className="mt-6 font-[gilroy] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5a3dbd] sm:mt-8 sm:text-xs"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.42, ease: 'easeOut' }}
              >
                Design + Technology + Growth
              </motion.p>

              <motion.p
                className="mt-4 max-w-xl font-[gilroy] text-sm leading-relaxed text-zinc-600 sm:mt-5 sm:text-base"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
              >
                We build the thinking and the making behind strong digital brands — interfaces, platforms and campaigns engineered
                to compound. Every engagement connects design craft, dependable technology and measurable growth in one team.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-5 sm:mt-10"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.58, ease: 'easeOut' }}
              >
                <Button href="#services" onClick={scrollToServices} arrow>
                  Explore services
                </Button>

                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center gap-2 font-[gilroy] text-sm font-semibold text-[#231746] transition-colors duration-300 hover:text-[#7c5cdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-2"
                >
                  Start a project
                  <span aria-hidden="true" className="block h-px w-8 bg-zinc-400 transition-all duration-500" />
                </Link>

              </motion.div>
            </div>

            <div className="lg:col-span-5">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <HeroCenterpiece shouldReduceMotion={shouldReduceMotion} />
              </motion.div>
            </div>
          </div>
        </div>
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
