import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const GooeyBlob = ({
  size = 300,
  colors = ["blue", "lightgreen", "pink"],
  blur = 100,
}) => {
  const blobRef = useRef(null);

  useEffect(() => {
    gsap.to(blobRef.current, {
      x: 40,
      y: -30,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
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
