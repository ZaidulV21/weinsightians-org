import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Privacy = () => {
  return (
    <div className="h-full w-full text-black px-5 md:px-16 p-5 font-[gilroy]">
      <Navbar />
      <div className="mt-10">
        <h2 className="text-3xl md:text-5xl text-center font-bold mb-4 text-[#6B50A2] ">Our commitment to protecting your <br /> privacy</h2>
        <h3 className='text-lg text-center font-thin mb-4'>Learn more about how WeInsightians collects and uses data and your rights as a WeInsightians user.</h3>
      </div>
        <div>
        <p className="mb-4">
        At WeInsightians, we prioritize the protection of your personal data. We
        collect, process, and use your personal information in accordance with
        this privacy policy and applicable data protection regulations.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6">Data Collection and Usage</h2>
      <h3 className="text-xl font-semibold mt-4">Website Visits</h3>
      <p className="mb-4">
        When you visit our website, our hosting provider automatically collects
        and stores certain information in server log files, including:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Referrer URL</li>
        <li>Time and date of access</li>
      </ul>
      <p className="mb-4">
        This data ensures proper website functionality, security, and helps us
        analyze user behavior to improve our services.
      </p>
      
      <h3 className="text-xl font-semibold mt-4">Cookies</h3>
      <p className="mb-4">
        Our website uses cookies to enhance user experience. Cookies are small
        text files stored on your device that help us recognize repeat visitors
        and gather usage data. You can manage cookie settings in your browser.
      </p>
      
      <h3 className="text-xl font-semibold mt-4">Google Analytics</h3>
      <p className="mb-4">
        We use Google Analytics to understand user interactions with our site.
        This helps improve our content and performance. Google Analytics has its
        own privacy policy that you can review separately.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6">Data Sharing and Security</h2>
      <p className="mb-4">
        We do not sell, trade, or transfer your personal data without consent,
        except when required by law. We implement appropriate security measures
        to protect your data from unauthorized access.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6">Your Rights</h2>
      <p className="mb-4">
        You have the right to access, correct, or delete your personal data.
        Contact us at <a href="mailto:mailtoweinsightians.com" className="text-blue-500">mailtoweinsightians.com</a> for any requests.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6">Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be
        posted on this page with an updated revision date.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6">Contact Information</h2>
      <p>
        Email: <a href="mailto:mailtoweinsightians.com" className="text-blue-500">mailtoweinsightians.com</a><br />
        Address: "Matiyari Lucknow , 226028"
      </p>
        </div>
      <Footer />
    </div>
  );
};

export default Privacy;

