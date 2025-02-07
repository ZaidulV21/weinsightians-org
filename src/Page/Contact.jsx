import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Faq from '../components/Faq'
import Whatsapp from '../components/Whatsapp'
import ContactForm from '../components/ContactForm'

const Contact = () => {
  return (
    <div className=' h-full w-full text-black px-5 md:px-16 p-5'>
      <Whatsapp />
      <Navbar />
      <div className='relative mt-2 md:mt-10 h-[70vh] md:h-[70vh] rounded-3xl overflow-hidden'>
      <video className='h-full w-full object-cover brightness-[50%]' src="/video/moon.mp4" autoPlay loop muted></video>
        <div className=' absolute bottom-0 left-0 p-4'>
          <h1 className='text-4xl md:text-9xl uppercase font-[larken] font-bold mb-4 text-white'>Contact us</h1>
          <hr className='border-t border-white my-4' />
          <p className='mb-8 text-sm md:text-2xl font-[gilroy] text-white'>We're here to help with anything you need. Want to get in touch with us? </p>
        </div>
      </div>
      <div className='mt-2 md:mt-10  flex h-full rounded-3xl'>
        {/* left form  */}
        <div className='w-1/3 hidden md:flex flex-col justify-between '>
        {/* left top section  */}
          <div className='ml-14 font-[gilroy]'>
            <div>
              <img className='border-2 rounded-lg p-1 w-10 absolute left-16' src="/img/chat.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Email us</h1>
              <h1 className=''>Our friendly team is here to help you</h1>
              <h1 className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'>
                <a href="mailto:mailtoweinsightians@gmail.com">mailtoweinsightians@gmail.com</a>
              </h1>
            </div>
            <div>
              <img className='border-2 rounded-lg p-1 w-10 absolute left-16' src="/img/location.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Visit us</h1>
              <h1 className=''>Come say hello to our office HQ.</h1>
              <a href="https://maps.app.goo.gl/TdXPwrSrYNBB1oKs5"><h1 className='font-bold mt-3 hover:text-gray-700 transition-all duration-500'> Matiyari Lucknow</h1></a>
            </div>
            <div>
              <img className='border-2 rounded-lg p-1 w-10 absolute left-16' src="/img/call.png" alt="" />
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
        <ContactForm/>
      </div>

      <Faq/>
      <Footer />
    </div>
  )
}

export default Contact