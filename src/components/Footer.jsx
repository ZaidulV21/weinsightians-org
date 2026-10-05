import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ADMIN_LOGIN_ROUTE } from '../routes';

/* The old hover nudged every list item with `hover:pl-4 transition-all`, which
 * animates padding: each hover relaid out the <li>, the <ul> and everything
 * beside it. A translate gives the same "it moves" feedback on the compositor. */
const LINK_ITEM = 'hover:translate-x-1 transition-transform duration-300 motion-reduce:transition-none';

const Footer = () => {
    return (
        <motion.div
            className='py-10'
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.2 }}
        >
            <div className='border-t-2 border-zinc-400'></div>
            <div className='mt-10 flex flex-col md:flex-row justify-between'>
                <div className='w-full  md:w-1/2'>
                    <NavLink to="/" className=''>
                        <img src='/img/we-logo.png' alt='We Insightians Logo' className='mr-2  w-[65vw] sm:w-[20vw]' />
                    </NavLink>
                    <p className='text-sm text-gray-600 mt-2 font-[gilroy]'>
                        We're here to help you with any inquiries <br />or project ideas you may have. Whether you have <br /> a question about our services, we’re ready to assist you.
                    </p>
                </div>
                <div className='w-full md:w-1/2 flex flex-col md:flex-row justify-between'>
                    {/** Column 1 */}
                    <motion.div className='w-full mt-5 md:mt-0 md:w-1/3 font-[gilroy]' whileHover={{ y: -2 }}>
                        <h2 className='font-semibold text-2xl'>Home</h2>
                        <ul className='text-base mt-3'>
                            <li className={LINK_ITEM}><NavLink to="/about">About Us</NavLink></li>
                            <li className={LINK_ITEM}><NavLink to="/">Our Work</NavLink></li>
                            <li className={LINK_ITEM}><NavLink to="/contact">Send Request</NavLink></li>
                            <li className={LINK_ITEM}><NavLink to="/contact#faq">FAQs</NavLink></li>
                           
                        </ul>
                    </motion.div>

                    {/** Column 2 */}
                    <motion.div className='w-full mt-5 md:mt-0 md:w-1/3 font-[gilroy]' whileHover={{ y: -2 }}>
                        <h2 className='font-semibold text-2xl'>Features</h2>
                        <ul className='text-base mt-3'>
                            <li className={LINK_ITEM}><NavLink to="/">Get Started</NavLink></li>
                            <li className={LINK_ITEM}><NavLink to="/blogs">Blog</NavLink></li>
                            <li className={LINK_ITEM}><NavLink to="/privacy">Privacy Policy</NavLink></li>
                            <li className={LINK_ITEM}><NavLink to="/sitemap">Sitemap</NavLink></li>
                        </ul>
                    </motion.div>

                    {/** Column 3 */}
                    <motion.div className='w-full mt-5 md:mt-0 md:w-1/3 font-[gilroy]' whileHover={{ y: -2 }}>
                        <h2 className='font-semibold text-2xl'>Social Media</h2>
                        <ul className='text-base mt-3'>
                            <li className={LINK_ITEM}><a href="https://instagram.com/weinsightians" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li className={LINK_ITEM}><a href="https://www.facebook.com/profile.php?id=61552381883595" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                            <li className={LINK_ITEM}><a href="https://www.linkedin.com/company/we-insightians/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                             <li >              <NavLink
                    to={ADMIN_LOGIN_ROUTE}
                    className='rounded-sm text-xs text-gray-400 underline decoration-gray-300 underline-offset-4 transition-colors duration-300 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 motion-reduce:transition-none'
                    > Admin Login</NavLink></li>
                        </ul>
                    </motion.div>
                </div>
            </div>

            <div className='mt-10 flex flex-col items-center gap-3 text-center'>
                <p className='text-sm text-gray-400'>© 2024 WeInsightians. All Rights Reserved.</p>

                {/* A way in for the site owner, and nothing more. It sits under
                    the copyright in the same muted type as the rest of the legal
                    line, so it is reachable and keyboard-operable without
                    competing with the customer-facing links above. It navigates to
                    the existing admin login screen — no admin capability, no
                    second login, and nothing is exposed by being linked here. */}

            </div>
        </motion.div>
    );
};

export default Footer;
