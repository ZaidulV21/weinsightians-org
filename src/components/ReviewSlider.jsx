import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import "../App.css";

// Swiper modules
import { EffectCoverflow, Autoplay } from "swiper/modules";

/*
 * Card surface, copied verbatim from PricingSection.jsx -> CARD_SURFACE.featured.
 * The Pricing Plans cards get their dark purple from their own <section>
 * (from-[#1e1b2c] to-[#2c2540]); this section sits on the light page
 * background (body { background: #eee }), so the same translucent gradient
 * would composite to a near-white lavender. The gradient is therefore stacked
 * over the pricing section's own dark stops at 0.94 alpha: the rendered
 * surface matches the Pricing Plans card almost exactly (rgb(50,43,77) vs
 * rgb(50,40,77)) while still leaving the page 6% visible, so backdrop-blur
 * continues to affect the backdrop.
 */
const GLASS_SURFACE =
  "border-white/30 backdrop-blur-xl backdrop-saturate-150 shadow-[0_30px_64px_-32px_rgba(20,12,44,0.95)] hover:border-white/45 hover:shadow-[0_40px_80px_-32px_rgba(20,12,44,1)]";

const reviews = [
  {
    content:
      '"We needed a modern website to showcase our cakes and pastries, and We insightians delivered beyond our expectations! Their team not only designed a stunning site but also optimized it for mobile, which has brought in so many new customers. Truly the best web development team in Lucknow!"',
    title: "Rakesh Sharma, Owner",
    job: "Sharma’s Delight Bakery",
  },
  {
    content:
      '"As a local electronics wholesaler, we were struggling to reach online customers. We Insightians team helped us create an e-commerce website that’s both functional and user-friendly. Their attention to detail and prompt support made the process seamless. Highly recommended!"',
    title: "Archita Rana, Manager",
    job: "Apex Electronics",
  },
  {
    content:
      '"Starting an online presence was daunting, but We Insightians team made it easy for us. They designed an elegant website that perfectly matches our brand. It’s helped us connect with clients beyond Lucknow. Thank you for your incredible work!"',
    title: "Meera Joshi, Founder",
    job: "Krishna Boutique",
  },
  {
    content:
      '"The team at We Insightians transformed our outdated website into a sleek, professional platform. Now, our booking system works flawlessly, and we’ve seen a significant increase in inquiries. They truly understand the needs of local businesses!"',
    title: "Abhinav Tripathi, Owner",
    job: "Blissful Stays",
  },
  {
    content:
      '"We were looking for a sleek website to promote our fitness center and online coaching services. The Insightians team not only delivered a stylish website but also integrated booking features seamlessly. We’ve seen a major increase in sign-ups and online engagement!"',
    title: "Arvind Sharma, Founder",
    job: "Urban Edge Fitness",
  },
  {
    content:
      '"Our old website wasn’t giving us the results we needed. After working with We Insightians, they revamped the entire site to reflect our business values. It\'s now an engaging experience for our customers, and we\'ve noticed a significant uptick in inquiries. Excellent work!"',
    title: "Prakash Gupta, Director",
    job: "Vibrant Ventures",
  },
  {
    content:
      '"I wanted a personal website to showcase my portfolio and blog, but I wasn’t sure where to start. The team at We Insightians took the time to understand my vision and designed a beautiful, clean, and professional website. It reflects my style perfectly, and I\'ve already received great feedback from clients and peers. The entire process was seamless, and I’m so glad I chose them!"',
    title: "Preeti Verma",
    job: "Freelancer",
  },
  {
    content:
      '"We needed a modern website to showcase our business and services, but we weren’t sure where to start. The team at We Insightians took the time to understand our vision and designed a beautiful, clean, and professional website. It reflects our brand perfectly, and we’ve already received great feedback from customers and partners. The entire process was seamless, and we’re so glad we chose them!"',
    title: "Nikhil Agrahari, Owner",
    job: "Agrahari Urban Developments",
  },
  {
    content:
      '"We were looking for a professional website to represent our car washing service online, and We Insightians delivered beyond our expectations. The site is clean, easy to navigate, and has attracted more customers than we anticipated. Their team also made sure the site was mobile-friendly, which has been great for our on-the-go customers. Highly recommend them for any local business!"',
    title: "Shivansh Verma, Owner",
    job: "Ayodhya Car Washing Hub",
  },
];

export default function App() {
  return (
    <>
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1}
        breakpoints={{
          768: {
            slidesPerView: 3,
          },
        }}
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
          disableOnInteraction: false,
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            {/* Glassmorphism Card */}
            <div
              className={`
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                bg-[linear-gradient(150deg,rgba(163,128,237,0.30),rgba(90,61,189,0.16)_52%,rgba(124,92,221,0.24)),linear-gradient(150deg,rgba(30,27,44,0.94),rgba(44,37,64,0.94))]
                p-6
                md:p-8
                transition-[transform,box-shadow,border-color]
                duration-500
                motion-reduce:transition-none
                hover:-translate-y-1.5
                motion-reduce:hover:translate-y-0
                ${GLASS_SURFACE}
              `}
            >
              {/* Soft glass highlight — same treatment as the Pricing Plans cards */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  h-28
                  bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_70%)]
                "
              />

              <div className="relative flex h-full flex-col justify-between">
                {/* Quote */}
                <p
                  className="
                    text-sm
                    leading-relaxed
                    text-gray-200
                    md:text-base
                    font-[gilroy]
                  "
                >
                  {review.content}
                </p>

                {/* User Info */}
                <div className="mt-8">
                  <h3
                    className="
                      text-lg
                      font-semibold
                      text-[#cbb6f7]
                      font-[gilroy]
                    "
                  >
                    {review.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
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