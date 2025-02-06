import React from 'react';

const Privacy = () => {
  return (
    <div className="h-full w-full text-black px-5 md:px-16 p-5">
      <h1 className="text-4xl md:text-9xl uppercase font-[larken] font-bold mb-4">Privacy Policy</h1>
      <hr className="border-t border-black my-4" />
      <p className="mb-8 text-sm md:text-2xl font-[gilroy]">We are committed to protecting your privacy. This privacy policy explains how we collect, use, and protect your personal information.</p>
      <h2 className="text-2xl md:text-4xl font-bold mb-4">What Information Do We Collect?</h2>
      <p className="text-sm md:text-2xl font-[gilroy]">We collect information that you provide to us, such as your name, email address, and phone number. We also collect information about your interactions with our website, such as your IP address and browser type.</p>
      <h2 className="text-2xl md:text-4xl font-bold mb-4">How Do We Use Your Information?</h2>
      <p className="text-sm md:text-2xl font-[gilroy]">We use your information to provide you with the services you request, to communicate with you, and to improve our website and services.</p>
      <h2 className="text-2xl md:text-4xl font-bold mb-4">How Do We Protect Your Information?</h2>
      <p className="text-sm md:text-2xl font-[gilroy]">We take reasonable measures to protect your information from unauthorized access, disclosure, alteration, and destruction.</p>
    </div>
  );
};

export default Privacy;

