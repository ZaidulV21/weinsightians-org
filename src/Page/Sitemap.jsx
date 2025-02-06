import React from 'react';

const Sitemap = () => {
  return (
    <div className="h-full w-full text-black px-5 md:px-16 p-5">
      <h1 className="text-4xl md:text-9xl uppercase font-[larken] font-bold mb-4">Sitemap</h1>
      <hr className="border-t border-black my-4" />
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
      </ul>
    </div>
  );
};

export default Sitemap;

