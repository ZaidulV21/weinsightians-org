import React from 'react';
import { motion } from 'framer-motion';
import { services } from '../data/services';
import ServiceCard from './ServiceCard';
import GooeyBlob from './GoeyCircle';
import Button from './Button.jsx';

const Page2 = () => {
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
        className='h-full w-full md:w-1/2'
        variants={{
          hidden: { opacity: 0, x: 100 },
          visible: { opacity: 1, x: 0 },
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        >
        <div className='relative w-full h-1/3 pt-10 transforming-heading'>
          <div className='font-[Gilroy] font-bold text-5xl flex gap-5 justify-end'>
            <h1 className='uppercase '>Transforming</h1>
       <div> <GooeyBlob/></div>
            <img className='h-10' src="/circle-design.png" alt="circle" />
          </div>
          <div className='font-bold font-[gilroy] uppercase text-4xl flex justify-end'>
            <h2>ideas into visually <br /> stunning realities.</h2>
          </div>
        </div>
        {/* Service Cards Scroll */}
        <div className="services-sections flex w-full flex-col gap-5 scroll-smooth sm:mt-40 md:h-[90vh] md:gap-2 md:overflow-y-auto md:rounded-[1.75rem] md:bg-zinc-100/50 md:p-2 md:ring-1 md:ring-zinc-200/60">
          {services.map((service, idx) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <ServiceCard service={service} index={idx} />
            </motion.div>
          ))}
          <div className="pointer-events-none sticky bottom-0 -mx-2 hidden justify-center bg-gradient-to-t from-zinc-100 via-zinc-100/90 to-transparent pb-1 pt-5 md:flex">
            <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 font-[gilroy] text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Scroll
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Page2;
