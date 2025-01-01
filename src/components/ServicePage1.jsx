import React from 'react';
import Navbar from './Navbar';

const ServicePage1 = () => {
  return (
    <div className='bg-white h-2/3 px-16 p-5'>
      <Navbar/>
      <div className='absolute top-36'><h1 className='text-6xl font-medium font-[larken]'>Shaping the best brands <br /> and websites of <br /><span className='text-zinc-500'>tommorrow's greatest players</span></h1></div>
      <div className='absolute bottom-20'>
      <h1 className='font-[gilroy] text-base font-semibold' >WeInsightians is here for the ones who don't just follow trends, they set <br />them. Our services go beyond design, we're talking premium, high-impact <br />branding and web experiences that make your brand unforgettable.</h1>
      </div>
    </div>
  );
};

export default ServicePage1;
