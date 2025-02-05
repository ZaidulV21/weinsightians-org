import React from 'react'

const Page5 = () => {
  return (
    <div className='px-4 md:px-16'>
      <div className='text-5xl md:text-7xl uppercase font-[gilroy]'>
        <h1 className='text-2xl md:text-4xl'>Transform Your Vision into Reality with</h1>
        <h1 className='flex flex-col  gap-2 md:flex-row'>Our Insights <img className='w-20 md:w-32' src="/circle-design.png" alt="" />Your Success</h1>
      </div>
      <div className='flex flex-col md:flex-row justify-between mt-10 md:mt-28 -mb-2'>
        <h1 className='w-full md:w-1/2 font-[gilroy]'>"At We Insightians, we don’t just build websites—we craft digital experiences that empower businesses to grow, connect, and thrive. Based in Lucknow, we’re committed to helping local businesses shine in the digital world."</h1>
        <div className='flex flex-row md:justify-end mt-4 md:mt-0'>
            <a href="/contact" className='px-8 md:px-10 py-2 text-[#231746] font-semibold transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277] '>Contact Us</a>
            <div className='h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45 ml-4 md:mt-0'><img src="/right-arrow-black.png" alt="" /></div>
          </div>
      </div>
      
    </div>
  )
}

export default Page5