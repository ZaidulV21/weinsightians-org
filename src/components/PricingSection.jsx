import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const plans = [
  {
    name: "Standard Plan",
    subtitle: "Web Development Standard Package",
    oldPrice: "₹ 10,000",
    newPrice: "₹ 7,999",
    gst: "( + 18% GST ₹ 1,440 )",
    features: [
      "5 Pages Website",
      "1 Year Free Domain Name (.com .in .org)",
      "1 Year Free Cloud Hosting",
      "Dynamic Website (Premium Design)",
      "Admin Access",
      "Lifetime 24/7 Free Hosting Support",
      "Unlimited Images & Videos Upload",
      "Free SSL Certificate",
      "5 Free Email IDs",
      "SEO Friendly Website",
      "100% Responsive Website",
      "Live Chat Integration",
      "Payment Gateway Integration",
      "Social Media Integration",
      "Call Button Integration",
      "WhatsApp Button Integration",
      "Inquiry Form",
      "1 Year Free Technical Support",
      "Annual Renewal ₹4000"
    ],
    highlight: false
  },
  {
    name: "Premium Plan",
    subtitle: "Web Development Premium Package",
    oldPrice: "₹ 20,000",
    newPrice: "₹ 13,999",
    gst: "( + 18% GST ₹ 2,520 )",
    features: [
      "12 Pages Website",
      "1 Year Free Domain Name (.com .in .org)",
      "1 Year Free Cloud Hosting",
      "Dynamic Website (Premium Design)",
      "Admin Access",
      "Google Search Console Setup",
      "Lifetime 24/7 Free Hosting Support",
      "Unlimited Images & Videos Upload",
      "Free SSL Certificate",
      "10 Free Email IDs",
      "SEO Friendly Website",
      "100% Responsive Website",
      "Live Chat Integration",
      "Payment Gateway Integration",
      "Social Media Integration",
      "Call Button Integration",
      "WhatsApp Button Integration",
      "Inquiry Form",
      "WooCommerce Features",
      "1 Year Free Technical Support",
      "Annual Renewal ₹4000"
    ],
    highlight: true
  },
  {
    name: "Custom Plan",
    subtitle: "Web Development Pro Package",
    oldPrice: "₹ ???",
    newPrice: "₹ ????",
    gst: "( + 18% GST Applicable )",
    features: [
      "Pages According to Requirement",
      "1 Year Free Domain Name (.com .in .org)",
      "1 Year Free Cloud Hosting",
      "Dynamic Website",
      "Admin Access",
      "Google Search Console Setup",
      "Lifetime 24/7 Free Hosting Support",
      "Unlimited Images & Videos Upload",
      "Free SSL Certificate",
      "10 Free Email IDs",
      "SEO Friendly Website",
      "100% Responsive Website",
      "Live Chat Integration",
      "Payment Gateway Integration",
      "Social Media Integration",
      "Call Button Integration",
      "WhatsApp Button Integration",
      "Inquiry Form",
      "WooCommerce Features",
      "1 Year 24/7 Free Support",
      "Annual Renewal ₹4000"
    ],
    highlight: false
  }
];

const PricingPlans = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current.forEach((card) => {
      gsap.fromTo(
        card,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",

         }
      );
    });
  }, []);

  return (
    <section className="py-32 px-4 rounded-3xl bg-gradient-to-br from-[#1e1b2c] to-[#2c2540]">
    {/* <section className="py-32 px-4 rounded-lg bg-gradient-to-br from-[#0e0b16] to-[#1a1626]"> */}
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-24">
        <h2 className="text-4xl md:text-6xl font-bold text-white font-[larken]">
          Website Pricing Plans
        </h2>
        <p className="text-gray-300 mt-4">
          Affordable, scalable, and professionally designed plans tailored to
          your business growth.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            ref={(el) => (cardsRef.current[index] = el)}
            className={`relative rounded-3xl p-8 backdrop-blur-xl transition-all
              ${
                plan.highlight
                  ? "bg-gradient-to-br from-[#7c5cdd] to-[#4b2fbf] text-white scale-105 shadow-2xl"
                  : "bg-white/5 text-white border border-white/10"
              }
            `}
          >
            {plan.highlight && (
              <span className="absolute -top-4 right-6 bg-white text-black text-xs font-semibold px-4 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-sm opacity-80 mb-4">{plan.subtitle}</p>

            <div className="mb-6">
              <p className="line-through opacity-60">{plan.oldPrice}</p>
              <p className="text-4xl font-bold">{plan.newPrice}</p>
              <p className="text-sm opacity-70">{plan.gst}</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {plan.features.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-2.5 h-2.5 mt-2 rounded-full bg-[#7c5cdd]" />
                  {item}
                </li>
              ))}
            </ul>

            <motion.button
             onClick={() => window.location.href = "tel:+918081657756"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 rounded-xl font-semibold transition-all
                ${
                  plan.highlight
                    ? "bg-white text-black"
                    : "bg-[#7c5cdd] text-white"
                }
              `}
            >
              Call Now
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PricingPlans;
