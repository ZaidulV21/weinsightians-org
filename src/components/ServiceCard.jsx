import React from 'react';

const ServiceCard = ({ title, description }) => {
  return (
    <div className='bg-[#E3E7ED] flex gap-5 px-5 py-4 rounded-xl'>
      <div className='w-1/3'>
        <button className=" bg-white py-3 px-4 rounded-full text-sm font-bold tracking-wide font-[gilroy] text-[#231746] transition duration-300 hover:bg-[#534277] hover:text-white">
          {title}
        </button>
      </div>
      <div className='w-2/3'>
        <h1 className="text-sm font-medium font-[gilroy]">{description}</h1>
      </div>
    </div>
  );
};

export default ServiceCard;
