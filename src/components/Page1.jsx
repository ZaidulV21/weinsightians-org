import React from 'react'
import Navbar from './Navbar.jsx'

const Page1 = () => {
  return (
    <div className="bg-custom text-black px-4 sm:px-8 md:px-12 lg:px-16 min-h-screen p-3 sm:p-5">
      <Navbar />
      <div className='font-[larken] uppercase mt-16 font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl'>
        <h1 className='mb-2'>bring all your</h1>
        <h1 className='mb-2'>ideas to life with our</h1>
        <h1>creative magic</h1>
      </div>
      <div className='mt-6 font-thin text-base sm:text-lg md:text-xl font-[gilroy] max-w-2xl'>
        <p className='leading-relaxed'>
          Our creative team gets to work, crafting a custom design that's not
          only beautiful but functional. We develop your landing page using
          the latest technologies and best practices.
        </p>
      </div>
      <div className='flex sm:flex-row gap-0 sm:gap-6 mt-10'>
        <button className='font-[gilroy] px-10 py-2 text-[#231746] font-thin transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277] '>Get Started</button>
        <div className='bg-[#231746] h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45'><img src="/right-arrow.png" alt="" /></div>
      </div>
    
    </div>
  ) 
}

export default Page1