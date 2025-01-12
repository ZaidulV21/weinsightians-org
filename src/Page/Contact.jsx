import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Faq from '../components/Faq'
const Contact = () => {
  return (
    <div className='h-full w-full text-black px-16 p-5'>
      <Navbar />
      <div className='mt-10 h-[70vh] rounded-3xl overflow-hidden'>
        <h1 className='absolute bottom-12 z-10 text-9xl font-[larken] uppercase text-white'>contact Us</h1>
      <video className='h-full w-full object-cover' src="/moon.mp4" autoPlay loop muted></video>
      </div>
      <div className='mt-10  flex h-full rounded-3xl'>
        {/* left form  */}
        <div className='w-1/3 flex flex-col justify-between '>
        {/* left top section  */}
          <div className='ml-14 font-[gilroy]'>
            <div>
              <img className='border-2 rounded-lg p-1 w-10 absolute left-16' src="/img/chat.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Chat to us</h1>
              <h1 className=''>Our friendly team is here to help you</h1>
              <h1 className='font-bold mt-3'>akshatjaiswal4841@gmail.com</h1>
            </div>
            <div>
              <img className='border-2 rounded-lg p-1 w-10 absolute left-16' src="/img/location.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Visit us</h1>
              <h1 className=''>Come say hello to our office HQ.</h1>
              <h1 className='font-bold mt-3'>Anirudh Nagar Kadipur </h1>
            </div>
            <div>
              <img className='border-2 rounded-lg p-1 w-10 absolute left-16' src="/img/call.png" alt="" />
              <h1 className='mt-5 text-lg font-bold'>Talk to us</h1>
              <h1 className=''>Mon to Fri 8AM-9PM.</h1>
              <h1 className='font-bold mt-3'>7309975088</h1>
            </div>
          </div>
          {/* social Links  */}
          <div className='flex gap-2 ml-5 mb-5'>
          <a href="#"><img className='w-10' src="/img/whatsapp.png" alt="whatsapp" /></a>
          <a href="#"><img className='w-10' src="/img/facebook.png" alt="facebook" /></a>
          <a href="#"><img className='w-10' src="/img/twitter.png" alt="twitter" /></a>
          <a href="#"><img className='w-10' src="/img/instagram.png" alt="instagram" /></a>
          <a href="#"><img className='w-10' src="/img/linkedin.png" alt="link" /></a>
          </div>
        </div>
        {/* right form  */}
        <div className='h-full font-[gilroy] w-2/3 bg-[#6B50A2] rounded-2xl p-10'>
          <h1 className='text-5xl mt-10 mb-4'>Got ideas? We’ve got <br /> the skills. Let’s team up.</h1>
          <h2 className='text-base  mb-6'>Tell us more about yourself and what you’ve got in mind.</h2>

          <form className='flex flex-col gap-4'>
            <input
              type='text'
              placeholder="What's your name?"
              className='outline-none text-sm p-2 bg-inherit text-black placeholder-black  border-b-2 border-black'

            />
            <input
              type='email'
              placeholder='you@email.com'
              className='outline-none text-sm p-2 bg-inherit text-black placeholder-black  border-b-2 border-black'
            />
            <textarea
              placeholder='Tell us a little about the project...'
              className='outline-none text-sm p-2 bg-inherit text-black placeholder-black  border-b-2 border-black h-24'
            />

            <h3 className='mt-4'>How can we help?</h3>
            <div className='flex gap-10'>
              <div className='flex flex-col gap-2'>
                <label>
                  <input type='checkbox' /> Website design
                </label>
                <label>
                  <input type='checkbox' /> UX design
                </label>
                <label>
                  <input type='checkbox' /> User research
                </label>
              </div>
              <div className='flex flex-col gap-2'>
                <label>

                  <input type='checkbox' /> Content creation
                </label>
                <label>
                  <input type='checkbox' /> Strategy & consulting
                </label>
                <label>
                  <input type='checkbox' /> Other
                </label>
              </div>
            </div>

            <button className='mt-6 bg-zinc-900 text-white py-2 rounded transition-all duration-500 hover:bg-zinc-700'>
              Let’s get started!
            </button>
          </form>
        </div>
      </div>

      <Faq/>


      <Footer />
    </div>
  )
}

export default Contact