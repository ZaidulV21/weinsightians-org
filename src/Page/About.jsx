import React from 'react';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'


const About = () => {
  return (
    <div className='h-full w-full text-black px-4 md:px-16 p-5'>
      {/* top */}
      <div className='h-auto w-full grid'>
        <Navbar />
        <div className='mt-5 md:mt-16 w-full h-[70vh] relative'>
          <img className='absolute rounded-md top-0 md:right-0 md:h-full w-full md:w-2/3' src="https://www.anthropics.com/portraitpro/img/page-images/homepage/v24/out-now-2.jpg" alt="" />
          <div className='absolute mt-48 md:-mt-0 md:left-5 md:-top-12 font-[larken] w-full md:w-1/2 z-10'>
            <h1 className='uppercase text-[#0F122E] text-5xl md:text-[16vh] leading-none'>
              We really love to work with people. <br />
              <span className='text-4xl md:text-6xl relative md:-top-12 font-[heligthon] capitalize'>WeInsightians</span>
            </h1>
          </div>
        </div>
        <div className='md:hidden w-full border-t-2 border-zinc-700'></div>
        {/* bottom  */}
        <div className='h-[35vh] flex flex-col md:flex-row gap-5 mt-16 top-32 md:top-0 relative'>
          <div className='w-full md:w-1/3 relative'>
            <div className='absolute bottom-10 w-full mr-14 font-[gilroy]'>
              <h1 className="text-xl md:text-2xl font-bold ">Follow Us</h1>

              <div className='flex mt-5 justify-between text-sm md:text-base'>
                <h1>Instagram</h1>
                <h1>↗</h1>
              </div>
              <div className='border-t-2 border-zinc-300'></div>
              <div className='flex mt-2 justify-between text-sm md:text-base'>
                <h1>LinkedIn</h1>
                <h1>↗</h1>
              </div>
              <div className='border-t-2 border-zinc-300'></div>
              <div className='flex mt-2 justify-between text-sm md:text-base'>
                <h1>Facebook</h1>
                <h1>↗</h1>
              </div>
              <div className='border-t-2 border-zinc-300'></div>
            </div>
          </div>
          <div className='w-full md:w-1/3 font-[gilroy] relative -mt-10 md:mt-0 '>
            <p className="mt-4 text-sm md:text-base text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
            <p className="mt-4 text-sm md:text-base text-gray-700">
              Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
          <div className='w-full md:w-1/3 p-5 font-[gilroy] relative '>
            <blockquote className="mb-10 text-lg md:text-xl font-bold">
              " Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur. "
            </blockquote>
            <div className='border-t-2 border-zinc-300'></div>
            <h1 className='text-zinc-800 mt-5'>Akshat Jaiswal</h1>
          </div>
        </div>
      </div>
      {/* section-2  */}
      <div className='mt-[20rem] md:mt-10 h-screen'>
        <h1 className='text-center text-5xl md:text-9xl font-[heligthon]'>Meet Our Team </h1>
        
        <div className="section2-image-container">
          <img src="https://cdn.prod.website-files.com/648884be5f32a12e5da2392f/65492b6d98261b9aedd2482e_NS_Logo-NaN.jpg" alt="" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
