import React, { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
// import { gsap } from 'gsap';

const Navbar = () => {
  return (
    <div id='glass-morph' className="z-[999] flex items-center justify-between font-medium overflow-hidden p-5 w-full h-20 rounded-lg">
      <Link to='/'>
        <div className='flex items-center gap-2 font-bold'>
          <img className='w-12 ' src='/bgWIcon.png' alt="logo" />
          <p className='text-lg'>WeInsightians</p>
        </div>
      </Link>
      {/* Pages  */}
      <div className='hidden sm:flex gap-5 text-sm font-[larken]'>
        <NavLink to='/' className='flex flex-col items-center gap-1 hover:text-gray-700' 
          isActive={({ isActive }) => isActive}>
          {({ isActive }) => (
            <>
              <p>Home</p>
              <hr className={`w-2/3 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
            </>
          )}
        </NavLink>

        <NavLink to='/services' className='flex flex-col items-center gap-1 hover:text-gray-700'>
          <p>Services</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/about' className='flex flex-col items-center gap-1 hover:text-gray-700'>
          <p>About Us</p>
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
      <div className='font-semibold flex items-center gap-6 font-[gilroy]'>
        <button className='px-8 py-3 text-[#fff] rounded-full transition-all duration-500 border-2 bg-[#231746] hover:bg-[#534277] '>Call Us</button>
      </div>
    </div>
  );
}

export default Navbar;