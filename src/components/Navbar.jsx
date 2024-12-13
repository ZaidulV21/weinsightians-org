import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div id='glass-morph' className="flex items-center justify-between font-medium p-5 w-full h-10 bg-green-300 rounded-lg">
      <Link to='/'><img className='w-10' src='/bars-svgrepo-com.svg' alt="logo" /></Link>

      <div className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to='/products' className='flex flex-col items-center gap-1'>
          <p>Products</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/pricing' className='flex flex-col items-center gap-1'>
          <p>Pricing</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/api' className='flex flex-col items-center gap-1'>
          <p>Api for Developer</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/blog' className='flex flex-col items-center gap-1'>
          <p>Blog</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
          <p>Contact</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </div>
    </div>
  )
}

export default Navbar