import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const Whatsapp = () => (
  <a
    href="https://wa.me/918960637300"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with We Insightians on WhatsApp"
    className="group fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(37,211,102,0.35),0_2px_6px_rgba(16,24,40,0.18)] transition-[transform,box-shadow,background-color] duration-300 ease-out hover:scale-105 hover:bg-[#1eb95a] hover:shadow-[0_10px_28px_rgba(37,211,102,0.45),0_4px_10px_rgba(16,24,40,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 motion-reduce:transition-none motion-reduce:!transform-none md:bottom-6 md:right-6 md:h-14 md:w-14"
  >
    <FaWhatsapp aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7" />

    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-[#171126] px-2.5 py-1.5 font-[gilroy] text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 after:absolute after:left-full after:top-1/2 after:ml-[-4px] after:-translate-y-1/2 after:h-2 after:w-2 after:rotate-45 after:bg-[#171126] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none md:block"
    >
      Chat with us
    </span>
  </a>
);

export default Whatsapp;
