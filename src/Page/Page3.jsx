import React from 'react'

const Page3 = () => {
  return (
    <div className='h-screen bg-white px-16'>
      <div className='w-full h-1/3 bg-yellow-400 flex '>
        {/* Left Side  */}
        <div className='font-[gilroy]  mt-5 w-1/2'>
          <h1 className='text-xl font-bold'>See Our Portfolio Reels</h1>
          <h1 className='text-6xl mt-3'>Awesome</h1>
          <h1 className='text-6xl flex '><img className='h-[3vw]' src="/circle-design.png" alt="" /> works</h1>
        </div>
        {/* Right Side  */}
        <div className='flex left-0 mt-5 font-[gilroy] text-end'>
        <p className=''>We crafted detailed botanical illustrations to highlight the <br />natural ingredients used in the products. Each design was <br />carefully integrated into the packaging layout.</p>
        </div>
      </div>
    </div>
  )
}

export default Page3