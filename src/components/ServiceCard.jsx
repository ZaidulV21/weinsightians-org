import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ServiceCard = ({ title, description, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDescription = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className='bg-[#d0e3ff86] flex flex-col md:flex-row gap-5 px-6 py-6 rounded-2xl shadow-md cursor-pointer transition-all duration-300'
      onClick={toggleDescription}
    >
      {/* Title + Icon */}
      <div className='w-full md:w-2/3 flex items-center gap-3'>
        {icon && <img src={icon} alt="icon" className="w-6 h-6" />}
        <button className="bg-white py-3 px-4 rounded-full text-sm font-bold tracking-wide font-[gilroy] text-[#110e1a] transition duration-300 hover:bg-[#a380ed] hover:text-white">
          {title}
        </button>
      </div>

      {/* Description */}
      <div className='w-full md:w-3/3 text-sm font-[gilroy]'>
        {/* Always visible on md+ screens, toggle on small */}
<p
  className={`transition-all duration-300 text-sm sm:text-base md:text-lg leading-snug font-[gilroy] ${isOpen || window.innerWidth >= 768 ? 'opacity-100 max-h-[300px]' : 'opacity-0 max-h-0 overflow-hidden'}`}
>          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
