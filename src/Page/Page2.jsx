import React from 'react'
import ServiceCard from '../components/ServiceCard'
const Page2 = () => {
  return (
    <div className='h-[120vh] w-full bg-[#fff] flex px-16 '>
      {/* Left Side  */}
      <div className='h-full w-1/2 '>
      {/* Left Side Content */}
        <div className='w-full h-1/3 pt-10'>
          <h1 className='font-bold font-[larken] text-2xl'>About Us</h1>
          <h1 className='mt-6 w-[23rem] font-[gilroy] text-base'>An agency is an organization or entity that provides a specific service on behalf of another party. In many cases, agencies act as intermediaries.</h1>
          <div className='flex mt-10'>
            <button className='font-[gilroy] px-10 py-2 text-[#231746] font-semibold transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277]'>Learn More</button>
            <div className='h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45'><img src="/right-arrow-black.png" alt="" /></div>
          </div>
        </div>

        {/* Left side Card  */}
        <div className='h-2/3 bg-red-800 '>
          
        </div>
      </div>
      {/* Right Side  */}
      <div className='h-full w-1/2 '>
      {/* Right Side Content */}
      <div className='w-full h-1/3 pt-10'>
      <div className='font-[larken] font-bold text-6xl flex gap-5 justify-end'>
        <h1>Transforming</h1>
        <img className='h-14' src="/circle-design.png" alt="" />
      </div>
      <div className='font-bold font-[larken] text-5xl flex justify-end'>
        <h1>ideas into visually <br /> stunning realities.</h1>
      </div>
      </div>
      {/* Right Side Service Content  */}
      <div className='w-full h-2/3 bg-green-800'>
      
      </div>
      </div>
    </div>
  )
}

export default Page2