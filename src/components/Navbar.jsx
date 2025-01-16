import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div id='glass-morph' className="z-[999] flex items-center justify-between font-medium overflow-hidden p-5 w-full h-20 rounded-lg">
        {/* Logo */}
        <Link to='/'>
          <div className='flex items-center gap-2 font-bold'>
            <img className='w-12' src='/bgWIcon.png' alt="logo" />
            <p className='text-lg'>WeInsightians</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex gap-5 text-sm font-[larken]'>
          <NavLink to='/' className='flex flex-col items-center gap-1 hover:text-gray-700'>
            {({ isActive }) => (
              <>
                <p>Home</p>
                <hr className={`w-2/3 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
          <NavLink to='/about' className='flex flex-col items-center gap-1 hover:text-gray-700'>
            {({ isActive }) => (
              <>
                <p>About</p>
                <hr className={`w-2/3 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
          <NavLink to='/services' className='flex flex-col items-center gap-1 hover:text-gray-700'>
            {({ isActive }) => (
              <>
                <p>Services</p>
                <hr className={`w-2/3 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
          <NavLink to='/blog' className='flex flex-col items-center gap-1 hover:text-gray-700'>
            {({ isActive }) => (
              <>
                <p>Blog</p>
                <hr className={`w-2/3 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
          <NavLink to='/contact' className='flex flex-col items-center gap-1 hover:text-gray-700'>
            {({ isActive }) => (
              <>
                <p>Contact</p>
                <hr className={`w-2/3 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
        </div>

        {/* Desktop Call Button */}
        <div className='hidden md:flex font-semibold items-center gap-6 font-[gilroy]'>
          <button className='px-8 py-3 text-[#fff] rounded-full transition-all duration-500 border-2 bg-[#231746] hover:bg-[#534277]'>
            Call Us
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-gray-700 focus:outline-none z-50"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
           className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Panel */}
      <div className={`fixed font-[gilroy] top-0 right-0 h-full w-64 backdrop-blur-md bg-white/30 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full hidden'
      }`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-end mb-4">
              <button 
                onClick={closeMenu}
                className="text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-lg font-medium text-black ${isActive ? 'text-[#231746]' : 'text-black'}`
              }
              onClick={closeMenu}
            >
              Home
            </NavLink>
            <hr className="border-t border-gray-300" />
            <NavLink 
              to="/services" 
              className={({ isActive }) => 
                `text-lg font-medium text-black ${isActive ? 'text-[#231746]' : 'text-black'}`
              }
              onClick={closeMenu}
            >
              Services
            </NavLink>
            <hr className="border-t border-gray-300" />
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `text-lg font-medium text-black ${isActive ? 'text-[#231746]' : 'text-black'}`
              }
              onClick={closeMenu}
            >
              About Us
            </NavLink>
            <hr className="border-t border-gray-300" />
            <NavLink 
              to="/blog" 
              className={({ isActive }) => 
                `text-lg font-medium text-black ${isActive ? 'text-[#231746]' : 'text-black'}`
              }
              onClick={closeMenu}
            >
              Blog
            </NavLink>
            <hr className="border-t border-gray-300" />
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `text-lg font-medium text-black ${isActive ? 'text-[#231746]' : 'text-black'}`
              }
              onClick={closeMenu}
            >
              Contact
            </NavLink>
            <hr className="border-t border-gray-300" />
          </div>
          {/* Mobile Call Button */}
          <div className="mt-auto mb-10 pb-6">
            <button className='w-full px-8 py-3 text-[#fff] rounded-full transition-all duration-500 border-2 bg-[#231746] hover:bg-[#534277]'>
              Call Us
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;