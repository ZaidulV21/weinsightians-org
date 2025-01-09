import React from 'react';

const OurServices = () => {
  return (
  <>
    <div className='flex mt-5 justify-between items-center font-[gilroy]'>
      <div className='w-1/3 '>
        <h1 className='text-4xl font-bold'>Digital Services</h1>
        <p className='mt-4'>
          WeInsighians delivers digital services that don’t just tick boxes—they redefine expectations. From high-converting websites to immersive app experiences, we bring your vision to life with precision and impact. Our approach goes beyond the screen, creating digital solutions that resonate, engage, and leave a lasting impression. For brands ready to stand out, we’re here to make it happen.
        </p>
      </div>
      <ul className='mt-20 '>
        <li>Web Design</li>
        <li>Web Development</li>
        <li>UI/UX Design</li>
        <li>Product Design</li>
        <li>Mobile App Design</li>
        <li>Design Systems</li>
        <li>Landing Page Design</li>
        <li>Webflow Development</li>
        <li>Framer Development</li>
        <li>WordPress Development</li>
      </ul>
      <p className='font-bold'>(Premium & Bold)</p>
    </div>
{/* border  */}
<div className='w-full mt-10 h-[2px] bg-zinc-500 '></div>
    </>
  );
};

export default OurServices; 