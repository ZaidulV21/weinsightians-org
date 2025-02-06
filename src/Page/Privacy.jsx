import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Privacy = () => {
  return (
    <div className="h-full w-full text-black px-5 md:px-16 p-5 font-[gilroy]">
      <Navbar/>
      <div className="mt-10">
        <h2 className="text-4xl md:text-7xl text-center font-bold mb-4 ">Privacy Policy</h2>
        <div className="flex flex-col gap-4">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">What information do you collect?</h3>
            <p className='text-[#0F122E] text-lg'>We collect personal information such as name, email, and phone number when you contact us or subscribe to our newsletter.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">How do you use my information?</h3>
            <p className='text-[#0F122E] text-lg'>We use your information to respond to your inquiries, send you newsletters, and improve our services.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">Do you share my information with third parties?</h3>
            <p className='text-[#0F122E] text-lg'>No, we do not share your information with third parties without your consent.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">How do I opt-out of receiving emails?</h3>
            <p className='text-[#0F122E] text-lg'>You can opt-out of receiving emails by clicking the unsubscribe link at the bottom of our emails.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">How do you protect my information?</h3>
            <p className='text-[#0F122E] text-lg'>We use industry-standard security measures to protect your information from unauthorized access.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">How long do you keep my information?</h3>
            <p className='text-[#0F122E] text-lg'>We keep your information for as long as necessary to fulfill the purpose for which it was collected, or as required by law.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">How can I access or correct my information?</h3>
            <p className='text-[#0F122E] text-lg'>You can access or correct your information by contacting us directly.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">How do you handle children's privacy?</h3>
            <p className='text-[#0F122E] text-lg'>We do not intentionally collect information from children under the age of 13.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-[#6B50A2]">How do you notify me of changes to this policy?</h3>
            <p className='text-[#0F122E] text-lg'>We will notify you of changes to this policy by posting an updated version on our website.</p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Privacy;

