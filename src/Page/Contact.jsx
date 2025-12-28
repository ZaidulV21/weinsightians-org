import React from 'react'
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Faq from '../components/Faq'
import Whatsapp from '../components/Whatsapp'
import ContactForm from '../components/ContactForm'
import { motion } from 'framer-motion';


const Contact = () => {
  return (
  <><Helmet>
  <title>Contact Us - We Insightians | Let's Build Something Great</title>
  <meta name="description" content="Get in touch with We Insightians for web development, branding, and UI/UX design solutions. Let's work together to grow your business!" />
  <meta name="keywords" content="Contact We Insightians, Web Design Consultation, Digital Solutions, Business Inquiry" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://weinsightians.tech/contact" />
  <meta property="og:title" content="Contact We Insightians - Let's Connect" />
  <meta property="og:description" content="Reach out to us for top-tier digital solutions. We specialize in web design, branding, and creative business growth strategies." />
  <meta property="og:url" content="https://weinsightians.tech/contact" />
  <meta property="og:type" content="website" />
</Helmet>
    <div className=' h-full w-full text-black px-5 md:px-16 p-5'>
      <Whatsapp />
      <Navbar />
      <motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
      <div className=' get-in-touch relative mt-2 md:mt-4 h-[45vh] md:h-[45vh] rounded-3xl overflow-hidden'>
      {/* <video className='h-full w-full object-cover brightness-[50%]' src="/video/moon.mp4" autoPlay loop muted></video> */}
        <div className=' absolute bottom-0 left-0 p-4'>
          <h1 className='text-4xl md:text-6xl uppercase font-[Gilroy] font-bold mb-4 text-gray-800'>Get in Touch</h1>
          <hr className='border- border-[#adadad] my-4' />
          <p className='mb-8 text-sm md:text-xl font-[gilroy] text-gray-600'>We're here to help with anything you need. Want to get in touch with us? </p>
        </div>
      </div>
      </motion.div>

      <motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
  viewport={{ once: true }}
>
      <div className='mt-2 md:mt-10  flex h-full rounded-3xl gap-10'>
        {/* left form  */}
               <ContactForm/>
        <div className='w-1/3 hidden md:flex flex-col justify-between '>
        {/* left top section  */}
          <div className='ml-14 font-[gilroy]'>
            <div className='relative'>
              <img className='border-2 rounded-lg p-1 w-10 absolute right-[28vw]' src="/img/chat.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Email us</h1>
              <h1 className=''>Our friendly team is here to help you</h1>
              <h1 className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'>
                <a href="mailto:mailtoweinsightians@gmail.com">mailtoweinsightians@gmail.com</a>
              </h1>
            </div>
            <div className='relative '>
              <img className='border-2 rounded-lg p-1 w-10 absolute right-[28vw]' src="/img/location.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Visit us</h1>
              <h1 className=''>Come say hello to our office HQ.</h1>
              <a href="https://maps.app.goo.gl/TdXPwrSrYNBB1oKs5"><h1 className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'> Matiyari Lucknow</h1></a>
            </div>
            <div className='relative '>
              <img className='border-2 rounded-lg p-1 w-10 absolute right-[28vw]' src="/img/call.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Talk to us</h1>
              <h1 className=''>Mon to Fri 8AM-9PM.</h1>
              <a href="tel:+917309975088" className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'>+91 73099 75088</a>
            </div>
          </div>
          {/* social Links  */}
          <div className='flex gap-2 ml-5 mb-5'>
          <a href="https://wa.me/+917309975088"><img className='w-10' src="/img/whatsapp.png" alt="whatsapp" /></a>
          <a href=""><img className='w-10' src="/img/facebook.png" alt="facebook" /></a>
          <a href=""><img className='w-10' src="/img/twitter.png" alt="twitter" /></a>
          <a href="https://www.instagram.com/weinsightians"><img className='w-10' src="/img/instagram.png" alt="instagram" /></a>
          <a href="https://www.linkedin.com/company/we-insightians/"><img className='w-10' src="/img/linkedin.png" alt="link" /></a>
          </div>
        </div>
        {/* right form  */}
 
      </div>
</motion.div>

<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.6, delay: 0.4 }}
  viewport={{ once: true }}
>
      <Faq/>
      <Footer />
      </motion.div>
    </div>
    </>
  )
}

export default Contact