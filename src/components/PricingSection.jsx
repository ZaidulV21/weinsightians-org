import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const plans = [
  {
    name: "Standard Plan",
    subtitle: "Web Development Standard Package",
    oldPrice: "₹ 15,000",
    newPrice: "₹ 12,999",
    gst: "( + 18% GST ₹ 1,440 )",
    features: [
      { text: "5 Pages Website", available: true },
      { text: "1 Year Free Domain Name (.com .in .org)", available: true },
      { text: "1 Year Free Cloud Hosting", available: true },
      { text: "Dynamic Website (Premium Design)", available: true },

      { text: "Admin Access", available: false },
      { text: "1 Free Email IDs", available: false },
      { text: "SEO Friendly Website", available: false },
      { text: "Live Chat Integration", available: false },
      { text: "Payment Gateway Integration", available: false },
      { text: "Social Media Integration", available: false },
      { text: "WhatsApp Button Integration", available: false },

      { text: "Lifetime 24/7 Free Hosting Support", available: true },
      { text: "Limited Images & Videos Upload", available: true },
      { text: "Free SSL Certificate", available: true },
      { text: "100% Responsive Website", available: true },
      { text: "Call Button Integration", available: true },
      { text: "Inquiry Form", available: true },
      { text: "1 Year Free Technical Support", available: true },
      { text: "Annual Renewal ₹6000", available: true }
    ],
    highlight: false
  },

  {
    name: "Premium Plan",
    subtitle: "Web Development Premium Package",
    oldPrice: "₹ 28,000",
    newPrice: "₹ 24,999",
    gst: "( + 18% GST ₹ 2,520 )",
    features: [
      { text: "12 Pages Website", available: true },
      { text: "1 Year Free Domain Name (.com .in .org)", available: true },
      { text: "1 Year Free Cloud Hosting", available: true },
      { text: "Dynamic Website (Premium Design)", available: true },

      { text: "Admin Access", available: false },

      { text: "Google Search Console Setup", available: true },
      { text: "Lifetime 24/7 Free Hosting Support", available: true },
      { text: "Unlimited Images & Videos Upload", available: true },
      { text: "Free SSL Certificate", available: true },
      { text: "5 Free Email IDs", available: true },
      { text: "SEO Friendly Website", available: true },
      { text: "100% Responsive Website", available: true },
      { text: "Live Chat Integration", available: true },
      { text: "Payment Gateway Integration", available: true },
      { text: "Social Media Integration", available: true },
      { text: "Call Button Integration", available: true },
      { text: "WhatsApp Button Integration", available: true },
      { text: "Inquiry Form", available: true },

      { text: "WooCommerce Features", available: false },

      { text: "1 Year Free Technical Support", available: true },
      { text: "Annual Renewal ₹8000", available: true }
    ],
    highlight: true
  },

  {
    name: "E-Commerce Plan",
    subtitle: "Basic Package",
    oldPrice: "₹ 37,000",
    newPrice: "₹ 34,999",
    gst: "( + 18% GST ₹ 2,520 )",
    features: [
      { text: "20 Pages Website", available: true },
      { text: "1 Year Free Domain Name (.com .in .org)", available: true },
      { text: "1 Year Free Cloud Hosting", available: true },
      { text: "Dynamic Website (Premium Design)", available: true },
      { text: "Admin Panel Access", available: true },
      { text: "E-Commerce Features", available: true },
      { text: "Payment Gateway Integration", available: true },
      { text: "Google Search Console Setup", available: true },
      { text: "Lifetime 24/7 Free Hosting Support", available: true },
      { text: "Unlimited Images & Videos Upload", available: true },
      { text: "Free SSL Certificate", available: true },
      { text: "10 Free Email IDs", available: true },
      { text: "SEO Friendly Website", available: true },
      { text: "100% Responsive Website", available: true },
      { text: "Live Chat Integration", available: true },
      { text: "Social Media Integration", available: true },
      { text: "Call Button Integration", available: true },
      { text: "WhatsApp Button Integration", available: true },
      { text: "Inquiry Form", available: true },
      { text: "1 Year Free Technical Support", available: true },
      { text: "Annual Renewal ₹8000", available: true }
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
      { text: "Pages According to Requirement", available: true },
      { text: "1 Year Free Domain Name (.com .in .org)", available: true },
      { text: "2 Year Free Cloud Hosting", available: true },
      { text: "Dynamic Website", available: true },
      { text: "Admin Access", available: true },
      { text: "Google Search Console Setup", available: true },
      { text: "Lifetime 24/7 Free Hosting Support", available: true },
      { text: "Unlimited Images & Videos Upload", available: true },
      { text: "Free SSL Certificate", available: true },
      { text: "10 Free Email IDs", available: true },
      { text: "SEO Friendly Website", available: true },
      { text: "100% Responsive Website", available: true },
      { text: "Live Chat Integration", available: true },
      { text: "Payment Gateway Integration", available: true },
      { text: "Social Media Integration", available: true },
      { text: "Call Button Integration", available: true },
      { text: "WhatsApp Button Integration", available: true },
      { text: "Inquiry Form", available: true },
      { text: "WooCommerce Features", available: true },
      { text: "1 Year 24/7 Free Support", available: true },
      { text: "Annual Renewal ₹4000", available: true }
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
          ease: "power3.out"
        }
      );
    });
  }, []);

  return (
    <section className="py-32 px-4 rounded-3xl bg-gradient-to-br from-[#1e1b2c] to-[#2c2540]">

      <div className="text-center max-w-3xl mx-auto mb-24">
        <h2 className="text-4xl md:text-6xl font-bold text-white font-[larken]">
          Website Pricing Plans
        </h2>
        <p className="text-gray-300 mt-4">
          Affordable, scalable, and professionally designed plans tailored to
          your business growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-7xl mx-auto">
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
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className={`flex gap-3 items-start ${
                    !feature.available ? "opacity-50 line-through" : ""
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 mt-2 rounded-full ${
                      feature.available
                        ? "bg-[#7c5cdd]"
                        : "bg-gray-500"
                    }`}
                  />
                  {feature.text}
                </li>
              ))}
            </ul>

            <motion.button
              onClick={() => (window.location.href = "tel:+918081657756")}
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
