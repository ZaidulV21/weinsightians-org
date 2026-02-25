import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GoeyCircle from './GoeyCircle';

const cardData = [
  {
    video: "/video/adgraphic_preview.mp4",
    brandName: "Adgraphic",
    workName: "Branding & Website Design",
    liveLink: "https://www.adgraphic.co.in",
    tags: ["Branding", "Web"],
    index: "01",
  },
  {
    video: "/video/medigencideo.mp4",
    brandName: "Medigen",
    workName: "Healthcare Platform",
    liveLink: "https://medigentechnology.com",
    tags: ["Platform", "UI/UX"],
    index: "02",
  },
  {
    video: "/video/BSS.mp4",
    brandName: "Bright Solar Solutions",
    workName: "Solar Energy Website",
    liveLink: "https://www.brightsolarsolutions.in",
    tags: ["Web", "Energy"],
    index: "03",
  },
];

function ProjectCard({ card, i }) {
  const videoRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleEnter = () => {
    setOpen(true);
    videoRef.current?.play();
  };

  const handleLeave = () => {
    setOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.12 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="group w-full border-b border-black/10 last:border-b-0 cursor-pointer"
    >
      {/* ── Header row ── */}
      <div className="flex items-center justify-between px-0 py-6 sm:py-7">
        {/* Left: index + text */}
        <div className="flex items-start gap-5 sm:gap-8">
          <span className="font-[Gilroy] text-xs font-semibold text-black/25 mt-1.5 shrink-0 tabular-nums">
            {card.index}
          </span>

          <div>
            <p className="font-[Gilroy] text-[10px] tracking-[0.18em] uppercase font-semibold text-black/40 mb-1">
              {card.brandName}
            </p>
            <h3
              className="font-[Gilroy] text-2xl sm:text-3xl md:text-4xl font-bold text-black leading-tight
                         transition-all duration-300 group-hover:translate-x-1"
            >
              {card.workName}
            </h3>

            {/* Tags — visible on small screens below title */}
            <div className="flex gap-2 mt-2 sm:hidden">
              {card.tags.map((t) => (
                <span
                  key={t}
                  className="font-[Gilroy] text-[9px] tracking-widest uppercase font-semibold
                             px-2.5 py-1 border border-black/15 text-black/40 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: tags + CTA */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            {card.tags.map((t) => (
              <span
                key={t}
                className="font-[Gilroy] text-[10px] tracking-widest uppercase font-semibold
                           px-3 py-1 border border-black/15 text-black/40 rounded-full
                           group-hover:border-black/30 group-hover:text-black/60 transition-all duration-300"
              >
                {t}
              </span>
            ))}
          </div>

          <a
            href={card.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 font-[Gilroy] text-[11px] tracking-widest uppercase
                       font-semibold text-black/40 hover:text-black transition-all duration-300 group/link"
            aria-label={`Visit ${card.brandName}`}
          >
            <span className="hidden sm:inline">Visit</span>
            <span
              className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center
                         group-hover/link:bg-black group-hover/link:border-black transition-all duration-300"
            >
              <svg
                className="w-3 h-3 text-black/40 group-hover/link:text-white transition-colors duration-300"
                viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
              >
                <path d="M1.5 8.5L8.5 1.5M8.5 1.5H4M8.5 1.5V6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* ── Video — expands on hover, full video visible, no cropping ── */}
      <div
        className="w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ maxHeight: open ? "70vw" : "0px", opacity: open ? 1 : 0 }}
      >
        <div
          className="w-full bg-black/5 rounded-2xl overflow-hidden mb-6"
          style={{ aspectRatio: "16/9" }}
        >
          <video
            ref={videoRef}
            src={card.video}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </motion.article>
  );
}

const Page3 = () => {
  return (
    <div id="our-work" className="min-h-screen p-5 sm:mb-16 sm:px-16">

      {/* ── Title section (preserved from original) ── */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full py-12 flex flex-col md:flex-row justify-between"
      >
        <div className="flex w-[75vw] relative items-center justify-between">
          <div className="font-[Gilroy] mt-5 w-full md:w-1/2">
            <h1 className="text-2xl font-bold">See Our Work</h1>
            <h2 className="text-5xl md:text-7xl mt-3">Awesome</h2>
            <div className="flex gap-3 items-center">
              <img className="h-10 md:h-12" src="/circle-design.png" alt="" />
              <h1 className="text-5xl md:text-7xl">Projects</h1>
            </div>
          </div>
          <div>
            <GoeyCircle />
          </div>
        </div>
      </motion.div>

      {/* ── "Hover to preview" hint ── */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="font-[Gilroy] text-[10px] tracking-[0.2em] uppercase text-black/30 font-semibold mb-2 text-right hidden sm:block"
      >
        Hover to preview
      </motion.p>

      {/* ── Project cards ── */}
      <div className="w-full border-t border-black/10">
        {cardData.map((card, i) => (
          <ProjectCard key={card.brandName} card={card} i={i} />
        ))}
      </div>

    </div>
  );
};

export default Page3;