import React from 'react';

// Main component
const OurServices2 = () => {
  const services = [
    {
      title: "Web Design",
      imgSrc: "/img/ser_Design.png",
      description: "We create visually appealing and user-friendly website designs tailored to your business needs. Our designs ensure a seamless user experience, optimized for both desktop and mobile devices. We focus on modern aesthetics, intuitive navigation, and engaging layouts that captivate visitors and drive conversions."
    },
    {
      title: "Web Development",
      imgSrc: "/img/ser_Development.png",
      description: "Our web development services bring your ideas to life with clean, efficient, and scalable code. We specialize in creating responsive, fast, and secure websites using the latest technologies. Whether you need a business website, an e-commerce platform, or a custom solution, we build high-performance websites that deliver results."
    },
    {
      title: "Social Media Management",
      imgSrc: "/img/ser_Social.png",
      description: "We help businesses grow their online presence with effective social media strategies. From content creation to engagement and analytics, we manage your social media profiles to enhance brand awareness and connect with your audience. Our goal is to increase your reach and drive meaningful interactions."
    },
    {
      title: "SEO & Digital Marketing",
      imgSrc: "/img/ser_Animation.png",
      description: "Boost your business visibility and attract more customers with our internet marketing services. We implement SEO strategies, pay-per-click advertising, email marketing, and content marketing to enhance your online reach. Our data-driven approach ensures maximum return on investment and business growth."
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

