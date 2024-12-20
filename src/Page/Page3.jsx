import React from 'react'

const Page3 = () => {
  return (
    <div className='h-screen bg-white px-16'>
      <div className='w-full h-1/3 flex '>
        {/* Left Side  */}
        <div className='font-[gilroy]  mt-5 w-1/2'>
          <h1 className='text-xl font-bold'>See Our Portfolio Reels</h1>
          <h1 className='text-6xl mt-3'>Awesome</h1>
          <h1 className='text-6xl flex '><img className='h-[3vw]' src="/circle-design.png" alt="" /> works</h1>
        </div>
        {/* Right Side  */}
        <div className='flex flex-col font-[gilroy] justify-center w-full'>
          <p className='text-end mb-4'>We crafted detailed botanical illustrations to highlight the <br />natural ingredients used in the products. Each design was <br />carefully integrated into the packaging layout.</p>
          <div className='flex justify-end'>
            <button className='px-10 py-2 text-[#231746] font-semibold transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277] '>Learn More</button>
            <div className='h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45'><img src="/right-arrow-black.png" alt="" /></div>
          </div>
        </div>
      </div>

      {/* Bottom Card Content */}
      <div className='w-full h-2/3 flex justify-center bg-red-500 items-center'>
      
      </div>
    </div>
  )
}

export default Page3