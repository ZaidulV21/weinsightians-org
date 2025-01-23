import React from 'react';

// Main component
const OurServices2 = () => {
  const services = [
    {
      title: "Web Design",
      imgSrc: "/img/ser_Design.png",
      description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
      title: "Web Development",
      imgSrc: "/img/ser_Development.png",
      description: "It is a long established fact that  Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
      title: "Social Media Management",
      imgSrc: "/img/ser_Social.png",
      description: "It  a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
      title: "Animation",
      imgSrc: "/img/ser_Animation.png",
      description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    }
  ];

   return services.map((service) => (
    <div key={service.title} className='flex flex-col md:flex-row h-auto md:h-[40%] mt-20 gap-5 relative'>
      <div className='w-full mt-10 md:mt-0 md:w-1/3 relative'>
        <h1 className='absolute bottom-5 font-bold text-4xl md:text-6xl font-[larken]'>{service.title}</h1>
      </div>
      <div className='w-full md:w-1/3 flex items-center justify-center'>
        <img className="rounded-xl h-60 md:h-80 transition-all duration-500 hover:scale-105 object-contain" loading="lazy" src={service.imgSrc} alt={service.title} />
      </div>
      <div className='w-full md:w-1/3 flex items-center font-[gilroy] font-bold text-zinc-800 bg-orange-00 overflow-hidden'>
        <h1 className='text-base md:text-sm'>{service.description}</h1>
      </div>
      {/* <div className='border-t-2 border-zinc-400'></div> */}
    </div>
  ));

}

export default OurServices2;

