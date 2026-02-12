import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMoon, FiSun } from "react-icons/fi";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);


useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, [darkMode]);


  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Main Top Navbar with fade-in */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        id='glass-morph'
        className="z-[999] flex  items-center justify-between font-medium  overflow-hidden p-5 w-full h-20 rounded-lg"
      >
        {/* Logo */}
        <Link to='/'>
          <div className='flex place-items-center gap-2 font-bold'>
            <img className='w-12 weinsightians-img' src='/img/bgWIcon.png' alt="logo" />
            <p className=' weinsightians text-3xl pt-1'>Weinsightians</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex gap-5 text-sm font-[larken]'>
          {['/', '/about', '/services', '/blogs', '/contact'].map((path, idx) => {
            const labels = ['Home', 'About', 'Services', 'Blog', 'Contact'];
            return (
              <NavLink key={path} to={path} className='flex flex-col items-center gap-1 hover:text-gray-700'>
                {({ isActive }) => (
                  <>
                    <p>{labels[idx]}</p>
                    <hr className={`w-2/3 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>


        {/* Desktop Call Button */}
        <div className='hidden md:flex font-semibold items-center gap-6 font-[gilroy]'>
          <a
            href="tel:+917309975088"
            className='px-8 py-3 text-[#f4f4f4] rounded-full transition-all duration-500 bg-[#04020b] hover:bg-[#534277]'
          >
            Call Us
          </a>
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
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className=" inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed font-[gilroy] top-0 right-0 h-full w-full backdrop-blur-md bg-white/30 shadow-lg z-50"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-end mb-4">
                <button onClick={closeMenu} className="text-gray-700 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-3">
                {['/', '/services', '/about', '/blogs', '/contact'].map((path, idx) => {
                  const labels = ['Home', 'Services', 'About Us', 'Blogs', 'Contact'];
                  return (
                    <React.Fragment key={path}>
                      <NavLink
                        to={path}
                        className={({ isActive }) =>
                          `text-lg font-medium text-black ${isActive ? 'text-[#231746]' : 'text-black'}`
                        }
                        onClick={closeMenu}
                      >
                        {labels[idx]}
                      </NavLink>
                      <hr className="border-t border-gray-300" />
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Mobile Call Button */}
              <div className="mt-auto mb-10 pb-6">
                <a
                  href="tel:+918081657756"
                  className='w-full px-8 py-3 text-[#fff] rounded-full  duration-200  hover:bg-[#1D4ED8]'
                >
                  Call Us
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
