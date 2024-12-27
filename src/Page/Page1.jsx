import React from 'react'
import Navbar from '../components/Navbar.jsx'

const Page1 = () => {
  return (
    <div className=" bg-custom text-black px-16 h-screen p-5">
      <Navbar />
      <div className='font-[larken] uppercase text-6xl mt-16 font-semibold '>
        <h1>bring all your</h1>
        <h1>ideas to life with our</h1>
        <h1>creative magic</h1>
      </div>
      <div className='mt-6 font-thin text-xl font-[gilroy]'>
      <p>Our creative team gets to work, crafting a custom design that's not
      <br />only beautiful but functional. We develop your landing page using
      <br />the latest technologies and best practices.</p>
      </div>
      <div className='flex mt-10'>
        <button className='font-[gilroy] px-10 py-2 text-[#231746] font-thin transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277] '>Get Started</button>
        <div className='bg-[#231746] h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45'><img src="/right-arrow.png" alt="" /></div>
      </div>
    
    </div>
  ) 
}

export default Page1