import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper React components

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import '../app.css';

// import required modules
import { EffectCoverflow, Autoplay } from 'swiper/modules';

const reviews = [
  {
    content: '"We needed a modern website to showcase our cakes and pastries, and We insightians delivered beyond our expectations! Their team not only designed a stunning site but also optimized it for mobile, which has brought in so many new customers. Truly the best web development team in Lucknow!"',
    title: "Rakesh Sharma, Owner",
    job: "Sharma’s Delight Bakery"
  },
  {
    content: '"As a local electronics wholesaler, we were struggling to reach online customers.We Insightians team helped us create an e-commerce website that’s both functional and user-friendly. Their attention to detail and prompt support made the process seamless. Highly recommended!"',
    title: "Archita Rana, Manager",
    job: "Apex Electronics"
  },
  {
    content: '"Starting an online presence was daunting, but We Insightians team made it easy for us. They designed an elegant website that perfectly matches our brand. It’s helped us connect with clients beyond Lucknow. Thank you for your incredible work!"',
    title: " Meera Joshi, Founder",
    job: "Krishna Boutique"
  },
  {
    content: '"The team at We Insightians transformed our outdated website into a sleek, professional platform. Now, our booking system works flawlessly, and we’ve seen a significant increase in inquiries. They truly understand the needs of local businesses!"',
    title: " Abhinav Tripathi, Owner",
    job: "Blissful Stays"
  },
  {
    content: '"We were looking for a sleek website to promote our fitness center and online coaching services. The Insightians team not only delivered a stylish website but also integrated booking features seamlessly. We’ve seen a major increase in sign-ups and online engagement!"',
    title: "Arvind Sharma, Founder",
    job: "Urban Edge Fitness"
  },
  {
    content: '"Our old website wasn’t giving us the results we needed. After working with We Insightians, they revamped the entire site to reflect our business values. It\'s now an engaging experience for our customers, and we\'ve noticed a significant uptick in inquiries. Excellent work!"',
    title: "Prakash Gupta, Director",
    job: "Vibrant Ventures"
  },
  {
    content: '"I wanted a personal website to showcase my portfolio and blog, but I wasn’t sure where to start. The team at We Insightians took the time to understand my vision and designed a beautiful, clean, and professional website. It reflects my style perfectly, and I\'ve already received great feedback from clients and peers. The entire process was seamless, and I’m so glad I chose them!"',
    title: "Preeti Verma",
    job: "Freelancer"
  },
  {
    content: '"We needed a modern website to showcase our business and services, but we weren’t sure where to start. The team at We Insightians took the time to understand our vision and designed a beautiful, clean, and professional website. It reflects our brand perfectly, and we’ve already received great feedback from customers and partners. The entire process was seamless, and we’re so glad we chose them!"',
    title: "Nikhil Agrahari, Owner",
    job: "Agrahari Urban Developments"
  },
  {
    content: '"We were looking for a professional website to represent our car washing service online, and We Insightians delivered beyond our expectations. The site is clean, easy to navigate, and has attracted more customers than we anticipated. Their team also made sure the site was mobile-friendly, which has been great for our on-the-go customers. Highly recommend them for any local business!"',
    title: "Shivansh Verma, Owner",
    job: "Ayodhya Car Washing Hub"
  },
  
];

export default function App() {
  return (
    <>
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={window.innerWidth < 768 ? '1' : '3'}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={false}
        modules={[EffectCoverflow, Autoplay]}
        className="mySwiper"
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
<div className="relative  from-[#1e1b2c] bg-gradient-to-br to-[#2c2540] backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-xl border border-white/20">
<div className="flex flex-col justify-between h-full">
  
  {/* Quote */}
  <p className="text-gray-200 text-sm md:text-base leading-relaxed font-[gilroy]">
    {review.content}
  </p>

  {/* User Info */}
  <div className="mt-8">
    <h2 className="text-[#7c5cdd] font-[gilroy] font-semibold text-lg">
      {review.title}
    </h2>

    <p className="text-sm text-gray-400 mt-1">
      {review.job}
    </p>
  </div>
</div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
