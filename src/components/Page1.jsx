import React from 'react'
import { motion } from 'framer-motion'
import Navbar from './Navbar.jsx'

const Page1 = () => {
  return (
    <div className="relative page-1 min-h-screen bg-custom-2 text-black px-4 sm:px-8 md:px-12 lg:px-16 p-3 sm:p-5">
      <video className='video-bg absolute top-0 left-0 w-full h-full object-cover -z-10' src="we.mp4" autoPlay muted playsInline loop></video>
      
      {/* Navbar */}
      <Navbar />

      {/* Animated Heading */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className='font-[larken] uppercase mt-12 pt-20 font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl z-10 relative'
      >
        <h1 className='mb-2 text-[#f3f4ff]'>Bringing Your Vision to Life – </h1>
        <h1 className='mb-2 text-[#eeeffa]'>Innovative Services Designed for Growth and Excellence</h1>
      </motion.div>

      {/* Animated Paragraph */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
        className='mt-6 font-thin text-base sm:text-lg md:text-xl font-[gilroy] max-w-2xl z-10 relative'
      >
        <p className='leading-relaxed text-[#eeeffa]'>
          Our creative team gets to work, crafting a custom design that's not
          only beautiful but functional. We develop your landing page using
          the latest technologies and best practices.
        </p>
      </motion.div>

      {/* Animated Button Group */}
      <motion.a
        href='/contact'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
        className='flex sm:flex-row gap-0 sm:gap-6 mt-10 z-10 relative'
      >
        <button className='font-[gilroy] px-10 py-2 text-[#f6f3ff] font-thin transition-transform-all duration-500 rounded-full border-1 bg-[#000] hover:bg-[#a380ed] hover:text-white'>
          Get Started
        </button>
        <div className='bg-[#060114] h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-1 hover:bg-[#a380ed] hover:rotate-45'>
          <img src="/right-arrow.png" alt="" />
        </div>
      </motion.a>
    </div>
  )
}

export default Page1
