import React from 'react';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'


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
    <div className='h-full w-full text-black px-4 md:px-16 p-5'>
      {/* top */}
      <Navbar />
      <div className='h-auto w-full grid'>
        <div className='mt-5 md:mt-16 w-full h-[70vh] relative'>
          <img className='absolute rounded-md top-0 md:right-0 md:h-full w-full md:w-2/3' src="https://www.anthropics.com/portraitpro/img/page-images/homepage/v24/out-now-2.jpg" alt="" />
          <div className='absolute mt-48 md:-mt-0 md:left-5 md:-top-12 font-[larken] w-full md:w-1/2 z-10'>
            <h1 className='uppercase text-[#0F122E] text-5xl md:text-[13vh] leading-none'>
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

              <div className='flex mt-5 justify-between text-sm md:text-base'>
                <h1>Instagram</h1>
                <h1>↗</h1>
              </div>
              <div className='border-t-2 border-zinc-300'></div>
              <div className='flex mt-2 justify-between text-sm md:text-base'>
                <h1>LinkedIn</h1>
                <h1>↗</h1>
              </div>
              <div className='border-t-2 border-zinc-300'></div>
              <div className='flex mt-2 justify-between text-sm md:text-base'>
                <h1>Facebook</h1>
                <h1>↗</h1>
              </div>
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
            <h1 className='text-zinc-800 mt-5'>Eleanor Roosevelt</h1>
          </div>
        </div>
      </div>
      {/* section-2  */}
      <div className='mt-[20rem] md:mt-10 h-auto'>
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
  );
};

export default About;
