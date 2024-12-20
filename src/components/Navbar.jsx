import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    // Logo 
    <div id='glass-morph' className="flex items-center justify-between font-medium overflow-hidden p-5 w-full h-20 bg-green-300 rounded-lg">
      <Link to='/'>
        <div className='flex items-center gap-2 font-medium'>
          <img className='w-12 ' src='/bgWIcon.png' alt="logo" />
          <p>WeInsightians</p>
        </div>
      </Link>
{/* Pages  */}
      <div className='hidden sm:flex gap-5 text-sm '>
        <NavLink to='/products' className='flex flex-col items-center gap-1 hover:text-gray-700'>
          <p>Products</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/pricing' className='flex flex-col items-center gap-1 hover:text-gray-700'>
          <p>Pricing</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/api' className='flex flex-col items-center gap-1 hover:text-gray-700'>
          <p>Api for Developer</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/blog' className='flex flex-col items-center gap-1 hover:text-gray-700'>
          <p>Blog</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/contact' className='flex flex-col items-center gap-1 hover:text-gray-700'>
          <p>Contact</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </div>
{/* Button  */}
      <div className='flex items-center gap-6'>
        <button className='px-8 py-3 text-[#fff] rounded-full transition-all duration-500 border-2 bg-[#231746] hover:bg-[#534277] '>Call Us</button>
      </div>
    </div>
  )
}

export default Navbar