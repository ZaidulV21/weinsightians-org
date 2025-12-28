import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

const OurServices2 = () => {
  const services = [
    {
      id: 1,
      title: 'Web Design',
      image: '/img/ser_Design.png',
      description: 'We create visually appealing and user-friendly website designs tailored to your business needs. Our designs ensure a seamless user experience, optimized for both desktop and mobile devices. We focus on modern aesthetics, intuitive navigation, and engaging layouts that captivate visitors and drive conversions.',
    },
    {
      id: 2,
      title: 'Web Development',
      image: '/img/ser_Development.png',
      description: 'Our web development services bring your ideas to life with clean, efficient, and scalable code. We specialize in creating responsive, fast, and secure websites using the latest technologies. Whether you need a business website, an e-commerce platform, or a custom solution, we build high-performance websites that deliver results.',
    },
    {
      id: 3,
      title: 'Social Media Management',
      image: '/img/ser_Social.png',
      description: 'We help businesses grow their online presence with effective social media strategies. From content creation to engagement and analytics, we manage your social media profiles to enhance brand awareness and connect with your audience. Our goal is to increase your reach and drive meaningful interactions.',
    },
    {
      id: 4,
      title: 'SEO & Digital Marketing',
      image: '/img/ser_Animation.png',
      description: 'Boost your business visibility and attract more customers with our internet marketing services. We implement SEO strategies, pay-per-click advertising, email marketing, and content marketing to enhance your online reach. Our data-driven approach ensures maximum return on investment and business growth.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b ">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold font-[Larken] text-gray-900 mb-8 border-b-2 pb-3 border-gray-400 inline-block">Our Services</h2>
          <p className="text-lg text-gray-600   max-w-2xl mx-auto">
            Comprehensive solutions to elevate your digital presence and drive business growth
          </p>
        </motion.div>

        <div className="space-y-24">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              isReversed={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ service, index, isReversed }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!imageRef.current) return;

    const handleMouseEnter = () => {
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
    };

    const element = imageRef.current;
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
    >
      <div ref={imageRef} className="w-full lg:w-1/2 overflow-hidden rounded-2xl ">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-80 lg:h-96 object-cover"
        />
      </div>

      <motion.div
        ref={textRef}
        initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isReversed ? 50 : -50 }}
        transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
        className="w-full lg:w-1/2 space-y-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 + index * 0.2 }}
        >
          <span className="text-sm font-semibold tracking-wider text-[#7c5cdd] uppercase">
            Service {index + 1}
          </span>
          <h3 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            {service.title}
          </h3>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.7 + index * 0.2 }}
          className="text-gray-600 leading-relaxed text-lg"
        >
          {service.description}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 + index * 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-8 py-3 bg-[#7c5cdd] text-white font-semibold rounded-full shadow-lg hover:bg-[#5a3dbd] transition-colors duration-300"
        >
          {/* scroll to contact */}
          <Link to="/contact"   >Get Started</Link>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default OurServices2;
