import React from 'react'

const Page5 = () => {
  return (
    <div className=' bg-white px-16'>
      <div className='text-7xl uppercase font-[gilroy] mt-10'>
        <h1>Create new </h1>
        <h1 className='flex gap-2'>innovation <img className='w-32 flex' src="/circle-design.png" alt="" />together</h1>
      </div>
      <div className='flex justify-between mt-28 -mb-2'>
        <h1 className='w-1/2'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quo reprehenderit rem rerum suscipit. Nam quidem consectetur, similique porro fugit repudiandae .</h1>
        <div className='flex justify-end'>
            <button className='px-10 py-2 text-[#231746] font-semibold transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277] '>Contact Us</button>
            <div className='h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45'><img src="/right-arrow-black.png" alt="" /></div>
          </div>
      </div>
      
    </div>
  )
}

export default Page5