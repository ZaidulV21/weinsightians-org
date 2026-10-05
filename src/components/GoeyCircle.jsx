import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GooeyBlob = ({
  size = 300,
  colors = ["blue", "lightgreen", "pink"],
  blur = 110,
}) => {
  const blobRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    /* Two things were wrong with the original tween. It was never killed, so it
     * outlived the component, and it ran forever even when the blob had scrolled
     * off screen — on a 110px blur that is a permanently re-blurring layer. The
     * tween is now owned by this effect and paused whenever the blob is out of
     * view, so it costs nothing while the visitor is reading the rest of the
     * page. */
    const tween = gsap.to(blobRef.current, {
      x: 40,
      y: -30,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tween.play();
        else tween.pause();
      },
      { rootMargin: "120px 0px" },
    );

    /* Hold the node in a local: by cleanup time blobRef.current may already be
       null because React has unmounted the wrapper. */
    const blob = blobRef.current;
    observer.observe(blob);

    return () => {
      observer.disconnect();
      tween.kill();
      if (blob) gsap.set(blob, { clearProps: "transform" });
    };
  }, []);

  return (
    <div
      ref={blobRef}
      className="gooey-wrapper"
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        zIndex: 1, // 👈 BACKGROUND layer
      }}
    >
      <div
        className="gooey-circle"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        }}
      />
    </div>
  );
};

export default GooeyBlob;
