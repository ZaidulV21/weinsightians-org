import React from 'react'
import ServiceCard from '../components/ServiceCard'

const Page2 = () => {
  return (
    <div className='h-[120vh] w-full bg-[#fff] flex px-16 '>
      {/* Left Side  */}
      <div className='h-full w-1/2 '>
        {/* Left Side Content */}
        <div className='w-full h-1/3 pt-10'>
          <h1 className='font-bold font-[larken] text-2xl'>About Us</h1>
          <h1 className='mt-6 w-[23rem] font-[gilroy] text-base'>An agency is an organization or entity that provides a specific service on behalf of another party. In many cases, agencies act as intermediaries.</h1>
          <div className='flex mt-5'>
            <button className='font-[gilroy] px-10 py-2 text-[#231746] font-semibold transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277]'>Learn More</button>
            <div className='h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45'><img src="/right-arrow-black.png" alt="" /></div>
          </div>
        </div>

        {/* Left side Card  */}
        <div className='h-2/3 px-12 py-1'>
          <div className='bg-custom h-full rounded-2xl p-4'>
            <div className='bg-[#E3E7ED] h-full rounded-xl'>
              {/* button  */}
              <div className="absolute top-10 right-8 flex space-x-2">
                <button className="border-2 border-zinc-700 px-4 py-2 rounded-full text-sm font-medium text-[#231746] transition duration-300 hover:bg-[#534277] hover:text-white">Our Services</button>
                <button className="border-2 border-zinc-700 px-4 py-2 rounded-full text-sm font-medium text-[#231746] transition duration-300 hover:bg-[#534277] hover:text-white">2024</button>
              </div>
              <div className='bg-[#6B50A2] h-24 w-24 rounded-full relative top-20 left-10 p-5'><img src="/right-arrow.png" alt="" /></div>
              <div className='mt-28 pl-10'>
                <h1 className='text-4xl text-black font-[larken]'>720+ Projects Launched</h1>
                <h1 className='text-base font-[gilroy]'>Empowering Our Agency's Growth and great power comes great responsbility. </h1>
                <button className='mt-10 px-10 py-5 border-zinc-700 border-2 hover:text-white font-semibold font-[gilroy] bg-[] rounded-full transition duration-300 hover:bg-[#534277]'>Get started Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side  */}
      <div className='h-full w-1/2 '>
        {/* Right Side Content */}
        <div className='w-full h-1/3 pt-10'>
          <div className='font-[larken] font-bold text-6xl flex gap-5 justify-end'>
            <h1>Transforming</h1>
            <img className='h-14' src="/circle-design.png" alt="" />
          </div>
          <div className='font-bold font-[larken] text-5xl flex justify-end'>
            <h1>ideas into visually <br /> stunning realities.</h1>
          </div>
        </div>
        {/* Right Side Service Content  */}
        <div className='w-full h-2/3 bg-gree-800 overflow-x-auto flex flex-col gap-2 '>
          <ServiceCard title="Digital Elevation 🡦" description="Empowering businesses with cutting-edge web development services that boost online visibility and drive success through tailored digital solutions designed for growth." />
          <ServiceCard title="Web Mastery 🡦" description="Crafting exceptional websites with innovative designs and robust functionalities to ensure your brand stands out in the digital landscape and achieves its goals." />
          <ServiceCard title="Design Excellence 🡦" description="Elevate your online presence with user-focused designs and development solutions that transform your ideas into impactful digital platforms tailored to your needs" />
          <ServiceCard title="Site Brilliance 🡦" description="Building dynamic and responsive websites that align with your business goals, ensuring maximum engagement and seamless user experiences for your customers." />
          <ServiceCard title="Online Impact 🡦" description="Transform your vision into reality with comprehensive web development services that amplify your digital presence and attract the right audience to your platform." />
          <ServiceCard title="Online Impact 🡦" description="Transform your vision into reality with comprehensive web development services that amplify your digital presence and attract the right audience to your platform." />
          <ServiceCard title="Online Impact 🡦" description="Transform your vision into reality with comprehensive web development services that amplify your digital presence and attract the right audience to your platform." />
        </div>
      </div>
    </div>
  )
}

export default Page2