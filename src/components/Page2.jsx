import React from 'react';
import { motion } from 'framer-motion';
import ServiceCard from './ServiceCard';
import GooeyBlob from './GoeyCircle';

const Page2 = () => {
  const services = [
    {
      title: "E-Commerce",
      description: "From product listings to secure checkout, we build fully-featured online stores that convert."
    },
    {
      title: "UI/UX Design",
      description: "Intuitive and visually engaging interfaces focused on improving user experience and retention."
    },
    {
      title: "Custom Websites",
      description: "We design and develop fast, responsive, and custom-coded websites tailored to your brand identity."
    },
    {
      title: "SEO & Marketing",
      description: "Drive more traffic with smart SEO strategies and marketing techniques that bring real results."
    },
    
    {
      title: "Website Support",
      description: "Ongoing website maintenance, updates, and technical support to keep your site running smoothly."
    },
    {
      title: "Social Media Marketing",
      description: "We manage and grow your brand’s presence on platforms like Instagram, Facebook, LinkedIn, and X through content strategies, campaigns, and community engagement."
    }
  ];

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
            <a href='/about' className='font-[gilroy] px-6 py-2 text-[#231746] mt-4  rounded-full border-2 bg-white hover:bg-[#a380ed] hover:text-white transition-all duration-500'>Learn More</a>
            <a href='/about' className='h-10 w-10 rounded-full flex items-center mt-4 justify-center hover:bg-[#a380ed] border-2 hover:rotate-45 transition-all duration-500'>
              <img src="/right-arrow-black.png" alt="arrow" />
            </a>
          </div>
        </div>

        {/* Card */}
        <div className="project-box w-[90vw] sm:w-[40vw] mt-16">
          <div className="bg-custom  tab-page-2 h-[95vh] sm:h-[70vh] md:h-[90vh]  rounded-3xl p-4">
            <div className="bg-[#e7e7e735] h-full rounded-sm relative">
              {/* Buttons */}
              <div className="absolute top-3 right-3 flex flex-col sm:flex-row gap-2">
                <a href='/services' className="border-2 border-zinc-500 px-4 py-2 rounded-full text-sm font-medium text-[#231746] hover:bg-[#a380ed] hover:text-white transition duration-300">
                  Our Services
                </a>
                <button className="border-2 border-zinc-500 px-4 py-2 rounded-full text-sm font-medium text-[#231746] hover:bg-[#a380ed] hover:text-white transition duration-300">
                  2024
                </button>
              </div>

              {/* Arrow Icon */}
              <div className="bg-[#1f1f1f] h-14 w-14 md:h-20 md:w-20 rounded-full relative top-10 left-3 p-4 flex items-center justify-center">
                <img src="/right-arrow.png" alt="Arrow Icon" className="w-5 h-5 md:w-7 md:h-7 transition-all duration-1000" />
              </div>

              {/* Content */}
              <div className="mt-14 sm:mt-20 pl-5">
                <h1 className="text-4xl sm:text-6xl md:text-8xl uppercase font-[gilroy] leading-tight">
                  22+ Projects Launched
                </h1>
                <h2 className="text-sm md:text-2xl font-[gilroy] mt-2">
                  Empowering our agency's growth, and with great power comes great responsibility.
                </h2>
                <button className="mt-6 px-6 py-3 text-[#231746] border-zinc-400 border-2 text-sm hover:text-white font-semibold bg-transparent rounded-full hover:bg-[#a380ed] transition duration-300">
                  <a href="/contact">Get Started Now</a>
                </button>
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
        <div className="w-full sm:mt-40 services-sections max-h-[49rem] overflow-y-auto flex flex-col gap-5 scroll-smooth">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <ServiceCard
                title={`${service.title} 🡦`}
                description={service.description}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Page2;
