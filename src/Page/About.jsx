import React from 'react';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Helmet } from 'react-helmet';


const About = () => {
  const TeamMemberCard = ({ name, role, imgSrc, socialLinks }) => {
    return (
      <div className='card overflow-x-hidden h-[450px] w-full max-w-[290px] flex-shrink-0 flex-grow-0 mx-[10px] scroll-snap-start flex flex-col'>
        <div className='card1'>
          <img className="transition-all duration-500 hover:scale-90" src={imgSrc} alt="team member" />
        </div>
        <div className='card2 p-5'>
          <h3 className='text-xl font-bold font-[gilroy] text-[#6B50A2]'>{name}</h3>
          <p className='text-gray-600 font-[gilroy] text-base'>{role}</p>
          <div className='flex mt-8'>
            {socialLinks.map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className='mr-4'>
                <img src={link.icon} alt={`${link.platform} Icon`} className='h-8 w-8' />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>About Us - We Insightians | Leading Web Development & Branding Agency</title>
        <meta name="description" content="Learn more about We Insightians, a top-rated web development and branding agency. Our team specializes in innovative digital solutions." />
        <meta name="keywords" content="About We Insightians, Web Design Agency, Digital Branding, UI/UX Experts, Business Solutions" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://weinsightians.tech/about" />
        <meta property="og:title" content="About We Insightians - Your Digital Growth Partner" />
        <meta property="og:description" content="Discover how We Insightians can transform your business with high-quality web development, UI/UX design, and branding solutions." />
        <meta property="og:url" content="https://weinsightians.tech/about" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className='h-full w-full text-black px-4 md:px-16 p-5'>
        {/* top */}
        <Navbar />
        <div className='h-auto w-full grid'>
          <div className='mt-5 md:mt-16 w-full h-[70vh] relative'>
            <img className='absolute rounded-md bg-[#E3E7ED] top-0 md:right-0 md:h-full w-full md:w-2/3' src="/img/about_us.jpg" alt="" style={{ objectFit: 'cover' }} />
            <div className='absolute mt-56 md:-mt-0 md:left-5 md:-top-12 font-[larken] w-full md:w-1/2 z-10'>
              <h1 className='uppercase text-[#0F122E] text-5xl md:text-[11vh] leading-none'>
                Meet the Insightians: Your Digital Growth Partners!<br />
                <span className='text-4xl md:text-6xl relative md:-top-2 font-[heligthon] capitalize'>WeInsightians</span>
              </h1>
            </div>
          </div>
          <div className='md:hidden w-full border-t-2 border-zinc-700'></div>
          {/* bottom  */}
          <div className='h-[35vh] flex flex-col md:flex-row gap-5 mt-16 top-32 md:top-0 relative'>
            <div className='w-full md:w-1/3 relative'>
              <div className='absolute bottom-10 w-full mr-14 font-[gilroy]'>
                <h1 className="text-xl md:text-2xl font-bold ">Follow Us</h1>

                <a href="https://instagram.com/weinsightians">
                  <div className='flex mt-5 justify-between text-sm md:text-base'>
                    <p>Instagram</p>
                    <p>↗</p>
                  </div>
                </a>
                <div className='border-t-2 border-zinc-300'></div>
                <a href="https://www.linkedin.com/company/we-insightians/">
                  <div className='flex mt-2 justify-between text-sm md:text-base'>
                    <p>LinkedIn</p>
                    <p>↗</p>
                  </div>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61552381883595">
                  <div className='border-t-2 border-zinc-300'></div>
                  <div className='flex mt-2 justify-between text-sm md:text-base'>
                    <p>Facebook</p>
                    <p>↗</p>
                  </div>
                </a>
                <div className='border-t-2 border-zinc-300'></div>
              </div>
            </div>
            <div className='w-full md:w-1/3 font-[gilroy] relative -mt-10 md:mt-0 '>
              <p className="mt-4 text-sm md:text-base text-gray-700">
                At We Insightians, three passionate individuals came together with one goal: to help local businesses in Lucknow thrive online.
              </p>
              <p className="mt-4 text-sm md:text-base text-gray-700">
                We understand that every small business has its own unique story, and we’re here to make sure that story gets told the right way. By focusing on the power of small data, we create websites that not only look great but drive real results.
              </p>
            </div>
            <div className='w-full md:w-1/3 p-5 font-[gilroy] relative '>
              <blockquote className="mb-10 text-lg md:text-xl font-bold">
                "The future belongs to those who believe in the beauty of their dreams. "
              </blockquote>
              <div className='border-t-2 border-zinc-300'></div>
              <p className='text-zinc-800 mt-5'>Eleanor Roosevelt</p>
            </div>
          </div>
        </div>
        {/* section-2  */}
        <div className="relative mt-[20rem] md:mt-10 h-[90vh] rounded-3xl overflow-hidden bg-[#E3E7ED]">
          <img
            className="absolute top-0 left-0 h-full w-full object-cover"
            src="/img/ediss.jpg"
            alt="Background"
          />

          <div className="absolute inset-0 p-5 overflow-y-auto bg-black bg-opacity-50 rounded-3xl">
            <h1 className="text-[2.5rem] mt-0 md:mt-10 md:text-7xl uppercase font-[larken] font-bold mb-4">Our Story</h1>
            <hr className="border-t border-gray-400 my-4" />
            <div className="text-sm md:text-base font-[gilroy]">
              <p>
                <span className="font-[larken]">WeInsightians, it all started in a small college dorm room</span>, where three friends—driven by curiosity and a passion for technology—spent hours brainstorming ideas. Between late-night coding sessions and endless discussions about the future, we noticed a common problem: businesses, especially startups, struggled to create a strong digital presence. They had incredible ideas but lacked the right tools to showcase them online. That’s when we had our aha! moment. With nothing but our laptops and an unshakable belief in our vision, <span className="font-[larken]">WeInsightians was born</span>.
              </p>
              <p className="mt-5">
                Turning this idea into reality wasn’t easy. We juggled college assignments with client projects, learning through trial and error. Our first few websites were built in the quiet hours of the night, fueled by coffee and sheer determination. There were setbacks—times when we questioned if we were ready, if we had what it took. But every challenge only made us more determined. Slowly, our work started gaining recognition, and what once felt like a distant dream became something real. Businesses trusted us, not just to build websites, but to bring their ideas to life in the digital world.
              </p>
              <p className="mt-5">
                Today, <span className="font-[larken]">WeInsightians stands as more than just an agency—it’s a journey, a passion, and a growing vision</span>. What started as three college friends chasing a dream has transformed into a team helping brands establish their identity, connect with audiences, and grow online. But this is just the beginning. We believe in innovation, pushing boundaries, and never settling for less. If there’s one thing our journey has taught us, <span className="font-[larken]">it’s that great things start with a bold idea and the courage to pursue it</span>. And with WeInsightians, that journey continues.
              </p>
            </div>
          </div>
        </div>

        {/* section-3  */}
        <div className='mt-10 h-auto'>
          <h1 className='text-center text-5xl md:text-9xl font-[heligthon]'>Meet Our Team </h1>
          <div className='flex overflow-x-auto gap-0 md:gap-10 md:justify-center items-center mt-10 '>
            <TeamMemberCard
              name="Akshat Jaiswal"
              role="Full Stack Developer"
              imgSrc="/img/Akshat.png"
              socialLinks={[
                { platform: 'Instagram', url: 'https://www.instagram.com/akshhat___/', icon: '/img/instagram.png' },
                { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/akshatjaiswal4841', icon: '/img/linkedin.png' },
                { platform: 'Facebook', url: 'https://www.facebook.com/akshat.jaiswal.96592', icon: '/img/facebook.png' }
              ]}
            />
            <TeamMemberCard
              name="Abhishek Kushwaha"
              role="Ads Expert"
              imgSrc="/img/Abhishek.jpg"
              socialLinks={[
                { platform: 'Instagram', url: 'https://www.instagram.com/its.me_void', icon: '/img/instagram.png' },
                { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/contactabhikushwaha/', icon: '/img/linkedin.png' },
                { platform: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100015401582577', icon: '/img/facebook.png' }
              ]}
            />
            <TeamMemberCard
              name="Zaidul Vasf"
              role="Web Designer"
              imgSrc="/img/Zaid.jpg"
              socialLinks={[
                { platform: 'Instagram', url: 'https://www.instagram.com/__zaidulvasf__', icon: '/img/instagram.png' },
                { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/zaidul-vasf-37a91a230/', icon: '/img/linkedin.png' },
                { platform: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100034579388077', icon: '/img/facebook.png' }
              ]}
            />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default About;
