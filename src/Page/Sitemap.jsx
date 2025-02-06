import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const sitemap = () => {
  return (
    <div className="h-full w-full text-black px-5 md:px-16 p-5 font-[gilroy]">
      <Navbar/>
      <div className="mt-10">
        <h2 className="text-4xl md:text-7xl text-center font-bold mb-4 ">Sitemap</h2>
        <ul className="list-none">
          <li className="mb-4">
            <a href="/" className='text-[#0F122E] text-lg'>Home</a>
          </li>
          <li className="mb-4">
            <a href="/about" className='text-[#0F122E] text-lg'>About Us</a>
          </li>
          <li className="mb-4">
            <a href="/services" className='text-[#0F122E] text-lg'>Services</a>
          </li>
          
          <li className="mb-4">
            <a href="/contact" className='text-[#0F122E] text-lg'>Contact Us</a>
          </li>
          <li className="mb-4">
            <a href="/blog" className='text-[#0F122E] text-lg'>Blog</a>
          </li>
          <li className="mb-4">
            <a href="/privacy" className='text-[#0F122E] text-lg'>Privacy Policy</a>
          </li>
        </ul>
      </div>
      <Footer/>
    </div>
  );
};

export default sitemap;

