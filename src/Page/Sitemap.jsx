import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Sitemap = () => {
  return (
    <div className="h-full w-full text-black px-5 md:px-16 p-5 font-[gilroy]">
      <Navbar />
      <div className="mt-10">
        <h2 className="text-4xl text-[#6B50A2] md:text-7xl font-bold mb-4">Sitemap</h2>
        <div className="grid mt-10 grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-bold text-2xl">Main</h3>
            <ul className="leading-10 text-lg">
              <li><a href="/">Home</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="#">Designer</a></li>
              
              <li><a href="#">Ecommerce</a></li>
              
              <li><a href="#">SEO</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-2xl">Privacy</h3>
            <ul className="leading-10 text-lg">
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="https://youtube.com" target='_blank'>Live Stream Archive</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-2xl">Community</h3>
            <ul className="leading-10 text-lg">
              <li><a href="#">Webflow Community</a></li>
              <li><a href="#">Forum</a></li>
              <li><a href="#">Discover</a></li>
              <li><a href="#">Webflow Designers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-2xl">Resources</h3>
            <ul className="leading-10 text-lg">
              <li><a href="https://dribbble.com/" target='_blank'>Help Site</a></li>
              <li><a href="#"></a></li>
              <li><a href="#">Ebooks</a></li>
              <li><a href="#">Service Status</a></li>
              <li><a href="">Website Builder</a></li>
              <li><a href="#">Website Design Software</a></li>
              <li><a href="#">Responsive Website Builder</a></li>
              <li><a href="#">CMS Website</a></li>
              <li><a href="#">Website Creator</a></li>
              <li><a href="#">Website Templates</a></li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Sitemap;

