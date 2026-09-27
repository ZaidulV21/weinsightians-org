import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiMinus, FiPhone } from "react-icons/fi";
import Button from './Button.jsx';

const PLANS = [
  {
    name: "Standard Plan",
    subtitle: "Web Development Standard Package",
    oldPrice: "₹ 15,000",
    newPrice: "₹ 12,999",
    gst: "( + 18% GST ₹ 1,440 )",
    custom: false,
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
    custom: false,
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
    highlight: true,
    badge: "Most Popular"
  },

  {
    name: "E-Commerce Plan",
    subtitle: "Basic Package",
    oldPrice: "₹ 37,000",
    newPrice: "₹ 34,999",
    gst: "( + 18% GST ₹ 2,520 )",
    custom: false,
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
    highlight: true,
    badge: "Best Value"
  },

  {
    name: "Custom Plan",
    subtitle: "Web Development Pro Package",
    oldPrice: "₹ ???",
    newPrice: "₹ ????",
    gst: "( + 18% GST Applicable )",
    custom: true,
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

const CALL_PHONE = "tel:+918081657756";

/* Highlighted plans get the strong glass treatment; the rest stay quiet. */
const CARD_SURFACE = {
  featured:
    "border-white/30 bg-[linear-gradient(150deg,rgba(163,128,237,0.30),rgba(90,61,189,0.16)_52%,rgba(124,92,221,0.24))] backdrop-blur-xl backdrop-saturate-150 shadow-[0_30px_64px_-32px_rgba(20,12,44,0.95)] hover:border-white/45 hover:shadow-[0_40px_80px_-32px_rgba(20,12,44,1)]",
  subtle:
    "border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.09),rgba(163,128,237,0.05)_58%,rgba(255,255,255,0.03))] backdrop-blur-md backdrop-saturate-[1.2] shadow-[0_18px_40px_-30px_rgba(20,12,44,0.85)] hover:border-white/20 hover:shadow-[0_26px_52px_-30px_rgba(20,12,44,0.95)]"
};

const FEATURE_ROW = {
  on: "text-white/90",
  off: "text-white/40"
};

/*
 * The shared <Button> ships dark-surface variants, so the quieter cards need a
 * translucent override to stay legible on the dark glass. `!` keeps the win
 * over the variant defaults without forking the Button component.
 */
const CTA_CLASS = {
  featured: "w-full focus-visible:ring-offset-0",
  subtle:
    "w-full !border !border-white/25 !bg-white/10 !text-white focus-visible:ring-offset-0 hover:!border-white/45 hover:!bg-white/20"
};

const PricingPlans = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b2c] to-[#2c2540] px-4 py-20 sm:px-6 md:py-24 lg:py-28">
      {/* Ambient light pools — give the glass cards something real to blur. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#7c5cdd]/25 blur-[110px]" />
        <div className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-[#a380ed]/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-96 rounded-full bg-[#5a3dbd]/20 blur-[130px]" />
      </div>

      <div className="relative mx-auto mb-14 max-w-3xl text-center sm:mb-20">
        <h2 className="font-[larken] text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl">
          Website Pricing Plans
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
          Affordable, scalable, and professionally designed plans tailored to
          your business growth.
        </p>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 sm:gap-7 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan, index) => (
          <motion.article
            key={plan.name}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.6,
              delay: shouldReduceMotion ? 0 : index * 0.08,
              ease: [0.22, 1, 0.36, 1]
            }}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border p-6 transition-[transform,box-shadow,border-color] duration-500 motion-reduce:transition-none sm:p-7 hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 ${
              plan.highlight ? CARD_SURFACE.featured : CARD_SURFACE.subtle
            }`}
          >
            {/* Subtle inner top highlight — the "lit edge" of the glass. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_70%)] ${
                plan.highlight ? "" : "opacity-60"
              }`}
            />

            {plan.badge && (
              <span className="absolute right-5 top-5 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2c2540] shadow-[0_8px_20px_-10px_rgba(20,12,44,0.8)] sm:text-[11px]">
                {plan.badge}
              </span>
            )}

            <div className="relative">
              <h3 className="pr-24 text-xl font-bold leading-tight text-white sm:text-2xl">
                {plan.name}
              </h3>
              <p className="mt-1.5 text-xs text-white/60 sm:text-sm">{plan.subtitle}</p>
            </div>

            <div className="relative mt-6 border-b border-white/10 pb-6">
              {plan.custom ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#cbb6f7]">
                    Custom Quotation
                  </p>
                  <p className="mt-2 font-[larken] text-3xl font-bold leading-none text-white sm:text-4xl">
                    Let&apos;s talk
                  </p>
                  <p className="mt-3 text-sm text-white/65">
                    Priced as per your requirement and scope of work.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-white/45">
                    <span className="sr-only">Original price </span>
                    <span aria-hidden="true" className="line-through">
                      {plan.oldPrice}
                    </span>
                  </p>
                  <p className="mt-1.5 font-[larken] text-[2rem] font-bold leading-none text-white sm:text-5xl">
                    {plan.newPrice}
                    <span className="ml-2 align-middle text-xs font-medium text-white/50">
                      excl. GST
                    </span>
                  </p>
                </>
              )}

              <p className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-white/80">
                {plan.gst}
              </p>
            </div>

            <ul className="relative mt-6 flex-1 space-y-2.5 text-sm">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                      feature.available
                        ? "border-[#a380ed]/70 bg-[#a380ed]/25 text-[#e6dcff]"
                        : "border-white/20 bg-white/[0.04] text-white/45"
                    }`}
                  >
                    {feature.available ? (
                      <FiCheck className="h-2.5 w-2.5" strokeWidth={3} />
                    ) : (
                      <FiMinus className="h-2.5 w-2.5" strokeWidth={3} />
                    )}
                  </span>
                  <span className={FEATURE_ROW[feature.available ? "on" : "off"]}>
                    <span className="sr-only">
                      {feature.available ? "Included: " : "Not included: "}
                    </span>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="relative mt-8">
              <Button
                type="button"
                onClick={() => (window.location.href = CALL_PHONE)}
                className={plan.highlight ? CTA_CLASS.featured : CTA_CLASS.subtle}
              >
                <FiPhone className="h-4 w-4" aria-hidden="true" />
                {plan.custom ? "Request a Quote" : "Call Now"}
              </Button>
            </div>
          </motion.article>
        ))}
      </div>

      <p className="relative mx-auto mt-12 max-w-3xl text-center text-xs text-white/50 sm:text-sm">
        All prices are in Indian Rupees (INR). GST at 18% is charged as
        applicable on the plan price. Call us for a tailored quotation.
      </p>
    </section>
  );
};

export default PricingPlans;
