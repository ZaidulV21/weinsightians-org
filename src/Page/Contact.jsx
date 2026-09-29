import React from 'react'
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer'
import Faq from '../components/Faq'
import Whatsapp from '../components/Whatsapp'
import ContactForm from '../components/ContactForm'
import { motion } from 'framer-motion';


const Contact = () => {
  return (
  <><Helmet>
  <title>Contact We Insightians | Let&rsquo;s Build Something Worth Experiencing</title>
  <meta
    name="description"
    content="Tell We Insightians about your project. Email us, call +91 73099 75088, or visit us in Matiyari, Lucknow. We reply to every enquiry and we are happy to answer questions first."
  />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://weinsightian.tech/contact" />
  <meta property="og:title" content="Contact We Insightians | Let&rsquo;s Build Something Worth Experiencing" />
  <meta
    property="og:description"
    content="Reach out to us for web design, development and branding. We are here to help with anything you need."
  />
  <meta property="og:url" content="https://weinsightian.tech/contact" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="We Insightians" />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>
    <div className=' h-full w-full text-black px-5 md:px-16 p-5'>
      <Whatsapp />
      <motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
      <div className=' get-in-touch relative mt-2 md:mt-4 h-[45vh] md:h-[30vh] rounded-3xl overflow-hidden'>
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
              <h2 className='mt-5 text-lg font-bold'>Email us</h2>
              <p className=''>Our friendly team is here to help you</p>
              <p className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'>
                <a href="mailto:mailtoweinsightians@gmail.com">mailtoweinsightians@gmail.com</a>
              </p>
            </div>
            <div className='relative '>
              <img className='border-2 rounded-lg p-1 w-10 absolute right-[28vw]' src="/img/location.png" alt="" />
              <h2 className='mt-5 text-lg font-bold'>Visit us</h2>
              <p className=''>Come say hello to our office HQ.</p>
              <a href="https://maps.app.goo.gl/TdXPwrSrYNBB1oKs5"><p className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'> Matiyari Lucknow</p></a>
            </div>
            <div className='relative '>
              <img className='border-2 rounded-lg p-1 w-10 absolute right-[28vw]' src="/img/call.png" alt="" />
              <h2 className='mt-5 text-lg font-bold'>Talk to us</h2>
              <p className=''>Mon to Fri 8AM-9PM.</p>
              <a href="tel:+917309975088" className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'>+91 73099 75088</a>
            </div>
          </div>
          {/* social Links  */}
          <div className='flex gap-2 ml-5 mb-5'>
          <a href="https://wa.me/+918081657756" aria-label="Chat with us on WhatsApp"><img className='w-10' src="/img/whatsapp.png" alt="" /></a>
          <a href="https://www.facebook.com/profile.php?id=61552381883595" target="_blank" rel="noopener noreferrer" aria-label="We Insightians on Facebook"><img className='w-10' src="/img/facebook.png" alt="" /></a>
          <a href="https://twitter.com/weinsightians" target="_blank" rel="noopener noreferrer" aria-label="We Insightians on X"><img className='w-10' src="/img/twitter.png" alt="" /></a>
          <a href="https://www.instagram.com/weinsightians" target="_blank" rel="noopener noreferrer" aria-label="We Insightians on Instagram"><img className='w-10' src="/img/instagram.png" alt="" /></a>
          <a href="https://www.linkedin.com/company/we-insightians/" target="_blank" rel="noopener noreferrer" aria-label="We Insightians on LinkedIn"><img className='w-10' src="/img/linkedin.png" alt="" /></a>
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