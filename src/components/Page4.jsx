// import React from 'react'
// import ReviewSlider from './ReviewSlider';





// export default Page4

import React from 'react';
import { motion } from 'framer-motion';
import ReviewSlider from './ReviewSlider';

const Page4 = () => {
  return (
    <div className='h-screen px-4 md:px-16'>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='w-full h-1/3 flex flex-col justify-center items-center space-y-2'
      >
        <h1 className='text-2xl md:text-xl font-semibold'>See from our client</h1>
        <h1 className='text-5xl md:text-6xl font-semibold font-[Gilroy]'>What our</h1>
        <h1 className='text-5xl md:text-6xl font-semibold font-[Gilroy] flex'>
          <img className='h-[11vw] md:h-[4vw] hidden md:inline' src='/circle-design.png' alt='' /> Clients say
        </h1>
      </motion.div>

      <motion.div
        className='w-full h-2/3 flex'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <ReviewSlider />
      </motion.div>
    </div>
  );
};

export default Page4;
