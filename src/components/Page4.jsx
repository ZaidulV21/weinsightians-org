import React from 'react'
import ReviewSlider from './ReviewSlider';




const Page4 = () => {
  return (
    <div className='h-screen px-4 md:px-16'>
      {/* Top Content */}
      <div className='w-full h-1/3 flex flex-col justify-center items-center space-y-2'>
        <h1 className='text-2xl md:text-xl font-semibold'>See from our client</h1>
        <h1 className='text-5xl md:text-6xl font-semibold font-[gilroy]'>What our</h1>
        <h1 className='text-5xl md:text-6xl font-semibold font-[gilroy] flex '><img className='h-[11vw] md:h-[4vw] hidden md:inline' src="/circle-design.png" alt="" /> Clients say</h1>
      </div>
      {/* Bottom Content */}
      <div className='w-full h-2/3 flex'>
        <ReviewSlider />
      </div>

    </div>
  )
}

export default Page4