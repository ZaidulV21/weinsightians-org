import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Contact = () => {
  return (
    <div className='h-full w-full text-black px-16 p-5'>
      <Navbar />
      <div className='mt-10 h-[70vh] bg-teal-600 rounded-3xl'>

      </div>
      <div className='mt-10  flex h-full bg-teal-600 rounded-3xl'>
        <div className='h-full w-1/3 bg-[#fff] '></div>
        {/* <div className='h-full w-2/3 bg-[#6B50A2] rounded-2xl'>
        <h1>Got ideas? We've got the skills. Let's Team up.</h1>
        <h1>Tell us more about yourself and what you're got in your mind.</h1>
        </div> */}
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
      <Footer />
    </div>
  )
}

export default Contact