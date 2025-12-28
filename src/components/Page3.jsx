import React from 'react';
import { motion } from 'framer-motion';
import GoeyCircle from './GoeyCircle';


const Page3 = () => {
  const cardData = [
    
    {
      video: "/video/adgraphic_preview.mp4",
      brandName: "Adgraphic",
      workName: "Branding & Website Design",
      liveLink: "https://www.adgraphic.co.in"
    },
    
    {
    video: "/video/medigencideo.mp4",
    brandName: "Medigen",
    workName: "Healthcare Platform",
    liveLink: "https://medigentechnology.com"
  },
  
  {
    video: "/video/BSS.mp4",
    brandName: "Bright Solar Solutions",
    workName: "Solar Energy Website",
    liveLink: "https://www.brightsolarsolutions.in"
  },
  ];

  return (
    <div id="our-work" className="min-h-screen p-5 sm:mb-16 sm:px-16">
      {/* Title */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full py-12 flex flex-col md:flex-row justify-between"
      >
        <div className="flex w-[75vw] relative items-center justify-between" >

        <div className="font-[Gilroy] mt-5 w-full md:w-1/2">
          <h1 className="text-2xl font-bold">See Our Work</h1>
          <h2 className="text-5xl md:text-7xl mt-3">Awesome</h2>
          <div className="flex gap-3 items-center">
            <img className="h-10 md:h-12" src="/circle-design.png" alt="" />
            <h1 className="text-5xl md:text-7xl">Projects</h1>
          </div>
        </div>
        <div>
        <GoeyCircle/>
        </div>
        </div>
      </motion.div>

      {/* Project Cards */}
      <div className="w-full  flex flex-wrap relative z-10 justify-center  mt-10 items-center font-[gilroy-regular]">
        <div className="w-full flex flex-nowrap overflow-x-auto gap-8 sm:gap-20 pb-6">
          {cardData.map((card, index) => (
            <motion.div
              key={index}
              className=" rounded-xl shadow-xl bg-[#E3E7ED]  w-[280px] sm:p-5 sm:w-[450px] flex-shrink-0 overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              {/* Video */}
              <div className="sm:h-[400px] h-[300px] z-10 hover:scale-95 hover:animate-pulse hover:transition-all overflow-hidden">
                <video
                  src={card.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col  bg-[#E3E7ED]">
                <h2 className=" font-bold text-lg sm:text-xl  uppercase">
                  {card.brandName}
                </h2>
                <p className=" text-sm sm:text-lg my-2 sm:my-4 text-gray-700">{card.workName}</p>

                <a
                  href={card.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 sm:mt-auto sm:w-32 w-1/2 inline-flex items-center justify-center rounded-full bg-[#7c5cdd] text-white  sm:px-5 py-2 text-sm sm:font-semibold font-[gilroy-regular] hover:bg-[#5a3dbd] transition"
                >
                  Visit  Website
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page3;