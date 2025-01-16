import React from 'react';
import Navbar from './Navbar';
import OurServices from './OurServices.jsx';
import OurServices2 from './OurServices2.jsx';
import Footer from './Footer.jsx'

const ServicePage1 = () => {
  return (
    <>
      {/* section1 */}
      <div className='h-screen px-4 md:px-16 p-5'>
        <Navbar />
        <div className='absolute top-36'><h1 className='text-4xl md:text-6xl font-medium font-[larken]'>Shaping the best brands <br /> and websites of <br /><span className='text-zinc-500'>tommorrow's greatest players</span></h1></div>
        <div className='absolute bottom-10 flex justify-between w-full md:w-[90%]'>
          <h1 className='font-[gilroy] text-sm md:text-base font-semibold' >WeInsightians is here for the ones who don't just follow trends, they set <br />them. Our services go beyond design, we're talking premium, high-impact <br />branding and web experiences that make your brand unforgettable.</h1>
          <img className='hidden md:inline h-20 rotate36 md:h-28' src="/img/64bbbf416decd23360ebb88c_get-in-touch-badge.svg" alt="getintotouch" />
        </div>
      </div>
      {/* section2 */}
      <div className='h-full w-full px-4 md:px-16 relative'>
        <div className='flex mt-20 md:mt-28 justify-between items-center font-[gilroy]'>
          <div className='relative'>
            <h1 className='mb-5 text-zinc-500'><span className='font-black'>•</span> Create gibberish history with us ewfuheif eufhiefewi </h1>
            <h1 className='text-4xl md:text-5xl'>From concept to execution our  <br />services are designed to set you apart</h1>
          </div>
          <div className='relative'>
            <h1 className=''>Start your project with us today</h1>
            <div className='absolute left-0 w-10 md:w-20 h-[2px] bg-zinc-500 transition-all duration-500 hover:w-full'></div>
          </div>
        </div>
        <div className='w-full mt-20 md:mt-28 h-[2px] bg-zinc-500 '></div>
        {/* Services  */}
        {/* <OurServices /> */}
        <OurServices2/>
        <Footer/>
      </div>
    </>
  );
};

export default ServicePage1;
