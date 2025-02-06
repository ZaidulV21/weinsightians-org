import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer = () => {
    return (
        <div className='py-10'>
            <div className='border-t-2 border-zinc-400'></div>
            <div className='mt-10 flex flex-col md:flex-row justify-between'>
                <div className='w-full md:w-1/2'>
                <NavLink to="/" className='w-1/3 flex items-center'>
                    <img src='/img/bgWIcon.png' alt='We Insightians Logo' className='mr-2 w-16 h-16' />
                    <h2 className='text-xl font-bold'>WeInsightians</h2>
                </NavLink>
                <p className='text-sm text-gray-600 mt-2 font-[gilroy]'>
                    We're here to help you with any inquiries <br />or project ideas you may have. Whether you have <br /> a question about our services, we’re ready to assist you.
                </p>
                </div>
                <div className='w-full md:w-1/2 flex flex-col md:flex-row justify-between'>
                    <div className='w-full mt-5 md:mt-0 md:w-1/3 font-[gilroy]'>
                        <h3 className='font-semibold text-2xl'>Home</h3>
                        <ul className='text-base mt-3'>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/about">About Us</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/">Our Work</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/contact">Send Request</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/contact#faq">FAQs</NavLink></li>
                        </ul>
                    </div>
                    <div className='w-full mt-5 md:mt-0 md:w-1/3 font-[gilroy]'>
                        <h3 className='font-semibold text-2xl'>Features</h3>
                        <ul className='text-base mt-3'>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/">Get Started</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/blog">Blog</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/privacy">Privacy Policy</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/sitemap">Sitemap</NavLink></li>
                        </ul>
                    </div>
                    <div className='w-full mt-5 md:mt-0 md:w-1/3 font-[gilroy]'>
                        <h3 className='font-semibold text-2xl'>Social Media</h3>
                        <ul className='text-base mt-3'>
                            <li className='hover:pl-4 transition-all duration-300'><a href="https://instagram.com/weinsightians" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li className='hover:pl-4 transition-all duration-300'><a href="https://www.facebook.com/profile.php?id=61552381883595" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                            <li className='hover:pl-4 transition-all duration-300'><a href="https://www.linkedin.com/company/we-insightians/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='mt-10 text-center'>
               <a href="#"> <p className='text-sm text-gray-600'>© 2024 WeInsightians. All Rights Reserved.
                </p></a>
            </div>
        </div>
    );
};

export default Footer;