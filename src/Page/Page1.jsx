import React from 'react'
import Navbar from '../components/Navbar.jsx'
const Page1 = () => {
  return (
    <div className=" bg-custom text-black px-16 h-screen p-5">
      <Navbar />
      <div className='uppercase text-6xl mt-16 font-semibold '>
        <h1>bring all your</h1>
        <h1>ideas to life with our</h1>
        <h1>creative magic</h1>
      </div>
      <div className='mt-6'>
      <p>Our creative team gets to work, crafting a custom design that's not</p>
      <p>only beautiful but functional. We develop your landing page using</p>
      <p>the latest technologies and best practices.</p>
      </div>
      <div className='flex '>
        <button className='px-10 py-2 text-[#231746] font-thin rounded-full border-2 bg-[#fff] hover:bg-[#534277] '>Get Started</button>
        <button disabled="disabled"></button>
      </div>
    </div>
  ) 
}

export default Page1