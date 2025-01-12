import React from 'react'
import Navbar from '../components/Navbar'

const Blog = () => {
  return (
    <>
    <div className='h-screen w-full px-16 pt-5 text-black '>
      <Navbar/>
      <div className='flex flex-col items-center justify-center h-[calc(100vh-100px)]'>
      <h1 className='text-5xl font-bold text-black font-[larken] '>Great Things are coming !!!!!</h1>
        <p className='text-2xl mt-4 font-[heligthon]'>Stay tuned for exciting updates and new content!</p>
        <a href="/" className='bg-black text-white mt-10 rounded-full border-[1px] border-white font-bold text-base transition-all duration-500 font-[gilroy] py-3 px-8 hover:bg-white hover:text-black hover:border-black '>
              Visit Us
            </a>
      </div>
    </div>
    </>
  )
}

export default Blog