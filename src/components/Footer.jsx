import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer = () => {
    return (
        <div className='py-10'>
            <div className='border-t-2 border-zinc-400'></div>
            <div className='mt-10 flex justify-between'>
                <div className='w-1/2'>
                <NavLink to="/" className='w-1/3 flex items-center'>
                    <img src='/bgWIcon.png' alt='We Insightians Logo' className='mr-2 w-16 h-16' />
                    <h2 className='text-xl font-bold'>WeInsightians</h2>
                </NavLink>
                <p className='text-sm text-gray-600 mt-2 font-[gilroy]'>
                    We're here to help you with any inquiries <br />or project ideas you may have. Whether you have <br /> a question about our services, we’re ready to assist you.
                </p>
                </div>
                <div className='w-1/2 flex justify-between'>
                    <div className='w-1/3 font-[gilroy]'>
                        <h3 className='font-semibold text-2xl'>Home</h3>
                        <ul className='text-base mt-3'>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/about">About Us</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/our-work">Our Work</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/community">Community</NavLink></li>
                        </ul>
                    </div>
                    <div className='w-1/3 font-[gilroy]'>
                        <h3 className='font-semibold text-2xl'>Features</h3>
                        <ul className='text-base mt-3'>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/get-started">Get Started</NavLink></li>
                            <li className='hover:pl-4 transition-all duration-300'><NavLink to="/privacy-policy">Privacy Policy</NavLink></li>
                        </ul>
                    </div>
                    <div className='w-1/3 font-[gilroy]'>
                        <h3 className='font-semibold text-2xl'>Social Media</h3>
                        <ul className='text-base mt-3'>
                            <li className='hover:pl-4 transition-all duration-300'><a href="https://instagram.com/whokilledakshhat" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li className='hover:pl-4 transition-all duration-300'><a href="https://www.linkedin.com/in/akshatjaiswal4841" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
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