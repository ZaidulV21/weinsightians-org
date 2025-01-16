import React from 'react'
import ServiceCard from './ServiceCard'

const Page2 = () => {
  return (
    <div className='min-h-[120vh] w-full bg-[#fff]  flex flex-col md:flex-row px-4 sm:px-8 md:px-12 lg:px-16'>
      {/* Left Side  */}
      <div className='h-full w-1/2 '>
        {/* Left Side Content */}
        <div className='w-full h-1/3 pt-10'>
          <h1 className='font-bold font-[larken] text-2xl'>About Us</h1>
          <h1 className='mt-6 w-[23rem] font-[gilroy] text-base'>An agency is an organization or entity that provides a specific service on behalf of another party. In many cases, agencies act as intermediaries.</h1>
          <div className='flex gap-2 sm:gap-2 mt-5'>
            <button className='font-[gilroy] px-5 sm:px-8 md:px-10 py-1.5 sm:py-2 text-sm sm:text-base text-[#231746] font-semibold transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277] hover:text-white'>Learn More</button>
            <div className='h-10 w-10 sm:h-12 sm:w-12 rounded-full flex transition-all duration-500 items-center justify-center p-1.5 sm:p-2 border-2 hover:rotate-45'><img src="/right-arrow-black.png" alt="" /></div>
          </div>
        </div>

        {/* Left side Card  */}
        <div className="w-[90vw] sm:w-[40vw] mt-5">
          <div className="bg-custom h-[45vh] sm:h-[70vh] md:h-[80vh] rounded-2xl p-4">
            <div className="bg-[#E3E7ED] h-full rounded-xl relative">
              {/* Buttons */}
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 md:top-10 md:right-8 flex flex-col sm:flex-row gap-2 sm:space-x-2">
                <button className="border-2 border-zinc-700 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-medium text-[#231746] transition duration-300 hover:bg-[#534277] hover:text-white">
                  Our Services
                </button>
                <button className="border-2 border-zinc-700 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-medium text-[#231746] transition duration-300 hover:bg-[#534277] hover:text-white">
                  2024
                </button>
              </div>
              {/* Circular Image */}
              <div className="bg-[#6B50A2] h-10 w-10 sm:h-14 sm:w-14 md:h-20 md:w-20 rounded-full relative top-10 sm:top-14 md:top-20 left-3 sm:left-5 md:left-8 p-2 sm:p-3 md:p-4 flex items-center justify-center">
                <img src="/right-arrow.png" alt="Arrow Icon" className="w-3 h-3 sm:w-5 sm:h-5 md:w-7 md:h-7" />
              </div>
              {/* Content */}
              <div className="mt-14 sm:mt-16 md:mt-24 pl-3 sm:pl-5 md:pl-8">
                <h1 className="text-lg sm:text-xl md:text-3xl text-black font-[larken] leading-tight">
                  720+ Projects Launched
                </h1>
                <h2 className="text-xs sm:text-sm md:text-base font-[gilroy] mt-1 sm:mt-2">
                  Empowering Our Agency's Growth, and with great power comes great responsibility.
                </h2>
                <button className="mt-3 sm:mt-4 md:mt-8 px-3 sm:px-5 md:px-8 py-1.5 sm:py-2 md:py-4 border-zinc-700 border-2 text-xs sm:text-sm md:text-base hover:text-white font-semibold font-[gilroy] bg-transparent rounded-full transition duration-300 hover:bg-[#534277]">
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Right Side  */}
        <div className='h-full w-full md:w-1/2'>
          {/* Right Side Content */}
          <div className='w-full h-1/3 pt-10'>
            <div className='font-[larken] font-bold text-4xl sm:text-5xl md:text-6xl flex gap-5 justify-end'>
              <h1>Transforming</h1>
              <img className='h-10 sm:h-12 md:h-14' src="/circle-design.png" alt="" />
            </div>
            <div className='font-bold font-[larken] text-4xl sm:text-5xl flex justify-end'>
              <h1>ideas into visually <br /> stunning realities.</h1>
            </div>
          </div>
          {/* Right Side Service Content  */}
          <div className='w-full mt-8 sm:mt-20 sm:h-full h-[calc(5*4rem)] overflow-x-auto flex flex-col gap-5'>
            <ServiceCard title="Digital Elevation 🡦" description="Empowering businesses with cutting-edge web development services that boost online visibility and drive success through tailored digital solutions designed for growth." />
            <ServiceCard title="Web Mastery 🡦" description="Crafting exceptional websites with innovative designs and robust functionalities to ensure your brand stands out in the digital landscape and achieves its goals." />
            <ServiceCard title="Design Excellence 🡦" description="Elevate your online presence with user-focused designs and development solutions that transform your ideas into impactful digital platforms tailored to your needs" />
            <ServiceCard title="Site Brilliance 🡦" description="Building dynamic and responsive websites that align with your business goals, ensuring maximum engagement and seamless user experiences for your customers." />
            <ServiceCard title="Online Impact 🡦" description="Transform your vision into reality with comprehensive web development services that amplify your digital presence and attract the right audience to your platform." />
          </div>
        </div>
      </div>
      )
}

      export default Page2