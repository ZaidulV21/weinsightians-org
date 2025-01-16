import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper React components

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import '../app.css';

// import required modules
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

const reviews = [
  {
    content: "We Insightians helped us achieve our goals by providing expert guidance and support throughout the project. Their insights were invaluable in navigating challenges, and their commitment to our success made a significant difference in our outcomes.",
    title: "Aarav Sharma",
    job: "Software Engineer"
  },
  {
    content: "We Insightians provided valuable insights for our project, enabling us to make informed decisions. Their analytical approach and attention to detail helped us identify key areas for improvement, ultimately leading to a more successful implementation.",
    title: "Vivaan Gupta",
    job: "Data Scientist"
  },
  {
    content: "We Insightians guided us through the challenges we faced during the development phase. Their expertise and proactive problem-solving skills ensured that we stayed on track and met our deadlines without compromising on quality.",
    title: "Aditya Verma",
    job: "Product Manager"
  },
  {
    content: "We Insightians supported our team in reaching new heights by fostering a collaborative environment. Their innovative strategies and creative solutions inspired us to think outside the box and push the boundaries of our capabilities.",
    title: "Vihaan Rao",
    job: "Graphic Designer"
  },
  {
    content: "We Insightians helped us streamline our processes, which significantly improved our efficiency. Their thorough analysis and recommendations allowed us to eliminate redundancies and focus on what truly matters for our business.",
    title: "Reyansh Patel",
    job: "Marketing Specialist"
  },
  {
    content: "We Insightians enabled us to make data-driven decisions that transformed our approach to business. Their insights into market trends and consumer behavior were instrumental in shaping our strategies and achieving our objectives.",
    title: "Krishna Iyer",
    job: "Business Analyst"
  },
  {
    content: "We Insightians assisted us in enhancing our online presence through targeted strategies and effective digital marketing. Their expertise in SEO and content creation helped us reach a wider audience and engage with our customers.",
    title: "Sai Kiran",
    job: "Web Developer"
  },
  {
    content: "We Insightians empowered us to build a strong team by providing training and development resources. Their focus on team dynamics and individual growth has led to a more cohesive and motivated workforce.",
    title: "Riya Singh",
    job: "HR Manager"
  },
  {
    content: "We Insightians inspired us to innovate and grow by encouraging a culture of creativity and experimentation. Their support in brainstorming sessions and workshops has led to groundbreaking ideas that have propelled our business forward.",
    title: "Anaya Mehta",
    job: "Content Writer"
  }
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
        pagination={true}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="mySwiper"
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className='bg-[#E3E7ED] text-black p-4 rounded-lg border-2 border-white w-full '>
              <div className='mt-4'>
                <p className='text-black font-[gilroy]'>{review.content}</p>
                <h2 className='text-[#6B50A2] font-[larken] font-bold text-xl mt-10'>{review.title}</h2>
                <hr className='my-2 border-t border-white' />
                <p className='text-black font-black font-[gilroy]'>{review.job}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
