
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const About = () => {
  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  const TeamMemberCard = ({ name, role, imgSrc, socialLinks }) => (
    <motion.div
      className='card  overflow-x-hidden h-[450px] w-full max-w-[290px] flex-shrink-0 flex-grow-0 mx-[10px] scroll-snap-start flex flex-col'
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className='card1'>
        <img className="transition-all duration-500 hover:-scale-1" src={imgSrc} alt="team member" />
      </div>
      <div className='card2 p-5'>
        <h3 className='text-xl font-bold font-[gilroy] text-[#a380ed]'>{name}</h3>
        <p className='text-gray-800 font-[gilroy] text-base'>{role}</p>
        <div className='flex mt-8'>
          {socialLinks.map((link, index) => (
            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className='mr-4'>
              <img src={link.icon} alt={`${link.platform} Icon`} className='h-8 w-8' />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );

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

      <div className='h-full bg-[#ffffff] w-full text-black px-4 md:px-16 p-5'>
        <Navbar />

        {/* Hero Section */}
        <motion.section
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="relative about-page-top mt-10 md:mt-20 flex flex-col-reverse md:flex-row items-center"
        >
          <div className="md:w-1/2 abt-top-heading z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#242424] leading-tight font-[larken]">
              Get to Know Us
            </h1>
            <h2 className="text-xl md:text-3xl mt-2 font-[heligthon] text-[#a380ed]">
              The Team Behind WeInsightians
            </h2>
            <p className="mt-6 text-base md:text-lg text-gray-700 font-[gilroy]">
              We’re not just developers — we’re storytellers, designers, and digital growth partners dedicated to helping businesses thrive online.
            </p>
          </div>
          <div className="md:w-1/2 relative mb-10 md:mb-0">
            <img
              src="https://img.freepik.com/free-vector/business-team-discussing-ideas-startup_74855-4380.jpg?ga=GA1.1.438993286.1747203228&semt=ais_hybrid&w=740"
              alt="Team Illustration"
              className="rounded-lg w-full object-cover "
            />
            {/* <video src="https://videos.pexels.com/video-files/6804109/6804109-sd_960_506_25fps.mp4"   alt="Team Illustration"
              className="rounded-lg w-full object-cover shadow-lg" loop autoPlay muted></video> */}

          </div>

        </motion.section>

        <div className='md:hidden w-full border-t-1 border-zinc-700'></div>

        {/* Follow Us / Story / Quote Section */}
        <motion.div
          className='h-auto flex flex-col md:flex-row gap-10 mt-24 relative'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Follow Us */}
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

          {/* Story */}
          <div className='w-full md:w-1/3 font-[gilroy] relative -mt-10 md:mt-0 '>
            <p className="mt-4 text-sm md:text-base ">
              At We Insightians, three passionate individuals came together with one goal: to help local businesses in Lucknow thrive online.
            </p>
            <p className="mt-4 text-sm md:text-base ">
              We understand that every small business has its own unique story, and we’re here to make sure that story gets told the right way.
            </p>
          </div>

          {/* Quote */}
          <div className='w-full md:w-1/3 p-5 font-[gilroy] relative '>
            <blockquote className="mb-10 text-lg md:text-xl font-bold">
              "The future belongs to those who believe in the beauty of their dreams."
            </blockquote>
            <div className='border-t-2 border-zinc-300'></div>
            <p className='mt-5'>Eleanor Roosevelt</p>
          </div>
        </motion.div>

        {/* Our Story Section */}
        <motion.div
          className="relative our-story mt-[20rem] md:mt-10 h-[90vh] rounded-xl overflow-hidden bg-[#e3e7ed38]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 p-5 overflow-y-auto bg-opacity-50 rounded-3xl">
            <h1 className="text-[2.5rem] mt-0 md:mt-10 md:text-7xl uppercase font-[larken] font-bold mb-4">Our Story</h1>
            <hr className="border-t border-gray-400 my-4" />
               <div className="text-sm md:text-base font-[gilroy] pt-8">
              <p>
                <span className="font-[larken] our-story-span text-[1.2vw]">WeInsightians, it all started in a small college dorm room</span>, where three friends—driven by curiosity and a passion for technology—spent hours brainstorming ideas. Between late-night coding sessions and endless discussions about the future, we noticed a common problem: businesses, especially startups, struggled to create a strong digital presence. They had incredible ideas but lacked the right tools to showcase them online. That’s when we had our aha! moment. With nothing but our laptops and an unshakable belief in our vision, <span className="font-[larken]">WeInsightians was born</span>.
              </p>
              <p className="mt-5 text-[1.2vw] our-story-span">
                Turning this idea into reality wasn’t easy. We juggled college assignments with client projects, learning through trial and error. Our first few websites were built in the quiet hours of the night, fueled by coffee and sheer determination. There were setbacks—times when we questioned if we were ready, if we had what it took. But every challenge only made us more determined. Slowly, our work started gaining recognition, and what once felt like a distant dream became something real. Businesses trusted us, not just to build websites, but to bring their ideas to life in the digital world.
              </p>
              <p className="mt-5">
                Today, <span className="font-[larken] our-story-span text-[1.2vw]">WeInsightians stands as more than just an agency—it’s a journey, a passion, and a growing vision</span>. What started as three college friends chasing a dream has transformed into a team helping brands establish their identity, connect with audiences, and grow online. But this is just the beginning. We believe in innovation, pushing boundaries, and never settling for less. If there’s one thing our journey has taught us, <span className="font-[larken]">it’s that great things start with a bold idea and the courage to pursue it</span>. And with WeInsightians, that journey continues.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Meet Our Team Section */}
        <motion.div
          className='mt-10 h-auto'
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 className='text-center text-5xl md:text-9xl font-[heligthon]'>Meet Our Team</h1>
          <div className='flex overflow-x-auto gap-24 md:gap-20 md:justify-center items-center mt-20 '>
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
              role="Web Developer"
              imgSrc="/img/Zaid.jpg"
              socialLinks={[
                { platform: 'Instagram', url: 'https://www.instagram.com/__zaidulvasf__', icon: '/img/instagram.png' },
                { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/zaidul-vasf-37a91a230/', icon: '/img/linkedin.png' },
                { platform: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100034579388077', icon: '/img/facebook.png' }
              ]}
            />
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
          </div>
        </motion.div>

        <Footer />
      </div>
    </>
  );
};

export default About;
