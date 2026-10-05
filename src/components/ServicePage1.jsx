import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import OurServices2 from './OurServices2.jsx';
import Footer from './Footer.jsx';
import PricingSection from './PricingSection.jsx';
import Button from './Button.jsx';

const HERO_GRID = {
  backgroundImage:
    'linear-gradient(to right, rgba(35, 23, 70, 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(35, 23, 70, 0.055) 1px, transparent 1px)',
  backgroundSize: '64px 64px',
};

const HERO_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E\")";

/* ------------------------------------------------------------------ *
 * WI SERVICE CORE — the right-side visual.
 * The Home hero is the full company ecosystem; this is the focused
 * capability system: one INSIGHT core, six SERVICES, two quiet orbits.
 * Same palette, glyphs and easing as the Home hero, far less of it.
 * ------------------------------------------------------------------ */

const CORE_POINT = { x: 50, y: 50 };

/* Six representative capabilities on one clean hexagon. The complete
 * service list stays in services.js and OurServices2 — this hero only
 * shows what still reads in a second. */
const CORE_NODES = [
  { id: 'web-design', label: 'Web Design', glyph: 'window', angle: 270, lift: 5, duration: 9.4, delay: 0.2 },
  { id: 'web-development', label: 'Web Dev', glyph: 'code', angle: 330, lift: 6, duration: 10.6, delay: 0.85 },
  { id: 'ai', label: 'AI Solutions', glyph: 'network', angle: 30, lift: 5, duration: 11.4, delay: 1.5 },
  { id: 'seo', label: 'SEO & Marketing', glyph: 'search', angle: 90, lift: 6, duration: 10.2, delay: 0.55 },
  { id: 'ecommerce', label: 'E-commerce', glyph: 'bag', angle: 150, lift: 5, duration: 9.8, delay: 1.15 },
  { id: 'ui-ux', label: 'UI/UX', glyph: 'layers', angle: 210, lift: 5, duration: 9, delay: 0.35 },
];

/* Below sm the ring tightens, so a phone gets a compact capability stack
 * rather than a shrunken diagram. */
const CORE_SCALE = {
  compact: {
    radius: 31,
    inner: 21,
    tile: 'h-9 w-9 rounded-[0.95rem]',
    icon: 'h-[15px] w-[15px]',
    label: 'text-[7px] tracking-[0.14em]',
    core: 'h-[34%] w-[34%]',
  },
  regular: {
    radius: 35,
    inner: 22.5,
    tile: 'h-10 w-10 rounded-[1.05rem]',
    icon: 'h-[17px] w-[17px]',
    label: 'text-[8px] tracking-[0.15em]',
    core: 'h-[38%] w-[38%]',
  },
};

/* Three translucent plates read as one layered glass pedestal under the core.
 * Kept tight so they frame the orb rather than becoming a slab. */
const CORE_PLATES = [
  { depth: 0, tilt: 57, spin: -14, shift: 9 },
  { depth: 18, tilt: 55, spin: -7, shift: 0 },
  { depth: 36, tilt: 53, spin: 0, shift: -9 },
];

/* Two slow signals, not a swarm. */
const CORE_FLOWS = [
  { from: 'web-development', color: '#67e8f9', duration: 14 },
  { from: 'seo', color: '#a380ed', duration: 19 },
];

const CORE_GLOW =
  'radial-gradient(closest-side, rgba(163,128,237,0.30), rgba(79,139,255,0.14) 54%, rgba(103,232,249,0) 76%)';

const CORE_ORB =
  'radial-gradient(circle at 33% 27%, #ffffff 0%, #f1eafd 17%, #cdb8f6 43%, #a380ed 66%, #6d4fd6 85%, #4f8bff 100%)';

const WIDE_QUERY = '(min-width: 640px)';

const polarPoint = (radius, angle) => {
  const rad = (angle * Math.PI) / 180;
  return { x: CORE_POINT.x + radius * Math.cos(rad), y: CORE_POINT.y + radius * Math.sin(rad) };
};

const cubicAt = (t, a, b, c, d) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

const LINK_SAMPLES = 24;

/* A gentle curve from a node into the core — present, never loud. */
const createCoreLink = (point, bow = 0.16) => {
  const dx = CORE_POINT.x - point.x;
  const dy = CORE_POINT.y - point.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = length * bow;
  const ox = (-dy / length) * bend;
  const oy = (dx / length) * bend;
  const c1 = { x: point.x + dx * 0.4 + ox, y: point.y + dy * 0.4 + oy };
  const c2 = { x: point.x + dx * 0.82 + ox * 0.28, y: point.y + dy * 0.82 + oy * 0.28 };

  const xs = [];
  const ys = [];
  for (let step = 0; step <= LINK_SAMPLES; step += 1) {
    const t = step / LINK_SAMPLES;
    xs.push(cubicAt(t, point.x, c1.x, c2.x, CORE_POINT.x));
    ys.push(cubicAt(t, point.y, c1.y, c2.y, CORE_POINT.y));
  }

  return {
    d: `M${point.x.toFixed(2)} ${point.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${CORE_POINT.x} ${CORE_POINT.y}`,
    track: { xs, ys },
  };
};

const buildCoreLayout = (scale) =>
  CORE_NODES.map((node, index) => {
    const point = polarPoint(scale.radius, node.angle);
    return { ...node, index, point, ...createCoreLink(point) };
  });

const indexById = (layout) =>
  layout.reduce((accumulator, node) => {
    accumulator[node.id] = node;
    return accumulator;
  }, {});

/* The node floats and the two orbits are pure transform work, so they run as
 * compositor-only CSS animations (the wis-* keyframes in index.css) instead of
 * ten main-thread Framer loops that used to keep ticking long after this hero
 * had scrolled away. `still` removes the animation, which is what reduced
 * motion and an off-screen hero both want. */
const bobStyle = (lift, duration, delay) => ({
  '--bob-lift': `${lift}px`,
  animation: `wis-bob ${duration}s cubic-bezier(0.45, 0, 0.55, 1) ${delay}s infinite`,
});

const spinStyle = (duration, reverse = false) => ({
  animation: `${reverse ? 'wis-spin-reverse' : 'wis-spin'} ${duration}s linear infinite`,
});

/* One node's parallax range, as a pair of transforms. Kept as its own hook so
 * the two useTransform calls inside it sit at the top level of a hook rather
 * than inside a map callback. See the note where it is used. */
const useNodeParallax = (x, y, reach) => ({
  x: useTransform(x, [-1, 1], [reach, -reach]),
  y: useTransform(y, [-1, 1], [reach * 0.7, -reach * 0.7]),
});

const useWideCore = () => {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(WIDE_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY);
    const sync = (event) => setWide(event.matches);
    query.addEventListener('change', sync);
    setWide(query.matches);
    return () => query.removeEventListener('change', sync);
  }, []);

  return wide;
};

/* Same 24-unit glyph language as the Home hero, so the two cores read as one
 * brand system. */
const CoreGlyph = ({ name, className = '', strokeWidth = 1.15 }) => {
  const shared = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  const shapes = {
    window: (
      <>
        <rect x="3" y="4.5" width="18" height="15" rx="2.6" />
        <path d="M3 9.2h18" />
        <path d="M5.7 6.85h.01M8.1 6.85h.01M10.5 6.85h.01" strokeWidth="1.6" />
        <path d="M13.1 11.7 12.1 16.5l1.6-.9 1.3 2 .95-.62-1.3-2 2.35-.28z" />
      </>
    ),
    code: (
      <>
        <path d="M8.6 8.2 4.9 12l3.7 3.8" />
        <path d="M15.4 8.2 19.1 12l-3.7 3.8" />
        <path d="M13.4 6.4 10.6 17.6" />
      </>
    ),
    bag: (
      <>
        <path d="M4.9 8.4h14.2l-1 10.3a2 2 0 0 1-2 1.8H7.9a2 2 0 0 1-2-1.8z" />
        <path d="M9 8.4V7a3 3 0 0 1 6 0v1.4" />
      </>
    ),
    layers: (
      <>
        <rect x="3.2" y="3.2" width="12.6" height="4.4" rx="1.6" />
        <rect x="3.2" y="9.2" width="12.6" height="4.4" rx="1.6" />
        <path d="M15.4 13.4 14.5 19.4l1.9-1.1 1.15 2.1.95-.52-1.15-2.1 2.25-.3z" />
      </>
    ),
    search: (
      <>
        <circle cx="10.3" cy="10.3" r="6.5" />
        <path d="M15.1 15.1 20.4 20.4" />
        <path d="M7.3 12.4 9.5 9.8l1.9 1.8 2.6-3.4" />
        <path d="M11.6 8.2h2.4v2.4" />
      </>
    ),
    network: (
      <>
        <circle cx="5.4" cy="6.2" r="1.9" />
        <circle cx="5.4" cy="17.8" r="1.9" />
        <circle cx="18.6" cy="6.2" r="1.9" />
        <circle cx="18.6" cy="17.8" r="1.9" />
        <circle cx="12" cy="12" r="1.9" />
        <path d="M7.05 7.5 10.4 10.55M16.95 7.5 13.6 10.55M7.05 16.5l3.35-3.35M16.95 16.5 13.6 13.15" />
      </>
    ),
  };

  return <svg {...shared}>{shapes[name]}</svg>;
};

const HeroCenterpiece = ({ still }) => {
  const wide = useWideCore();
  const scale = wide ? CORE_SCALE.regular : CORE_SCALE.compact;

  const layout = useMemo(() => buildCoreLayout(scale), [wide]);
  const byId = useMemo(() => indexById(layout), [layout]);

  const [hoverId, setHoverId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const litId = activeId || hoverId;

  /* Pointer response is deliberately small: a lean, not a drag. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 24, mass: 0.5 });
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 24, mass: 0.5 });

  const coreTilt = {
    rotateX: useTransform(smoothY, [-1, 1], [3.4, -3.4]),
    rotateY: useTransform(smoothX, [-1, 1], [-3.4, 3.4]),
  };
  const plateTilt = { rotateZ: useTransform(smoothX, [-1, 1], [-2.2, 2.2]) };
  const orbitTilt = { rotate: useTransform(smoothX, [-1, 1], [-1.8, 1.8]) };
  const linkDrift = {
    x: useTransform(smoothX, [-1, 1], [-1.6, 1.6]),
    y: useTransform(smoothY, [-1, 1], [-1.2, 1.2]),
  };
  const glowX = useTransform(smoothX, [-1, 1], [-9, 9]);
  const glowY = useTransform(smoothY, [-1, 1], [-7, 7]);

  /* Per-node parallax depth, with the hook calls at the top level.
   *
   * The previous version built this inside `layout.map(...)`, which called
   * useTransform from inside a callback. React only allows hooks at the top
   * level of a component or a custom hook: it tracks them by call order, so a
   * hook that runs conditionally or inside a loop can leave a component calling
   * a different hook than it did last render, and React throws. Here the array
   * length depends on `layout`, which depends on the viewport, so the count
   * genuinely could change between renders.
   *
   * `reach` only ever takes three values, because it cycles on `index % 3`:
   * 2, 3.4, 4.8 for the six nodes. So three fixed pairs of transforms are
   * created here and each node is pointed at one of them, which produces the
   * exact same x/y ranges per node as before.
   */
  const reachA = useNodeParallax(smoothX, smoothY, 2);
  const reachB = useNodeParallax(smoothX, smoothY, 3.4);
  const reachC = useNodeParallax(smoothX, smoothY, 4.8);
  const reaches = [reachA, reachB, reachC];
  const nodeParallax = layout.map((node) => reaches[node.index % 3]);

  const trackPointer = (event) => {
    if (still || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const settlePointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const coreBreath = still
    ? { scale: litId ? 1.05 : 1, transition: { duration: 0.5, ease: 'easeOut' } }
    : {
        scale: litId ? [1, 1.05, 1] : [0.99, 1.012, 0.99],
        y: [0, -3, 0],
        transition: {
          scale: { duration: litId ? 7 : 13, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 8.5, repeat: Infinity, ease: 'easeInOut' },
        },
      };

  const glowBreath = still
    ? { opacity: litId ? 1 : 0.8, transition: { duration: 0.5 } }
    : {
        opacity: litId ? [0.9, 1, 0.9] : [0.7, 0.95, 0.7],
        transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
      };

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[21rem] sm:max-w-[26rem] lg:max-w-[32rem]"
      onPointerMove={trackPointer}
      onPointerLeave={settlePointer}
      onClick={() => setActiveId(null)}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-[15%] bottom-[7%] h-8 rounded-[50%] bg-[radial-gradient(closest-side,rgba(35,23,70,0.18),transparent)] blur-lg"
      />

      {/* One quiet outer orbit, one inner one. Nothing else competing. */}
      <motion.svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
        style={{ ...orbitTilt, transformOrigin: '50% 50%' }}
      >
        <circle
          cx="50"
          cy="50"
          r={scale.radius}
          stroke="rgba(90,61,189,0.24)"
          strokeWidth="0.25"
          strokeDasharray="1.6 3.4"
          strokeLinecap="round"
          style={{ transformBox: 'view-box', originX: '50px', originY: '50px', ...(still ? undefined : spinStyle(150)) }}
        />
        <circle
          cx="50"
          cy="50"
          r={scale.inner}
          stroke="rgba(79,139,255,0.18)"
          strokeWidth="0.22"
          style={{ transformBox: 'view-box', originX: '50px', originY: '50px', ...(still ? undefined : spinStyle(110, true)) }}
        />
        <circle cx="50" cy={50 - scale.inner} r="0.5" fill="rgba(103,232,249,0.7)" />
        <circle cx={50 + scale.inner} cy="50" r="0.5" fill="rgba(163,128,237,0.6)" />
      </motion.svg>

      {/* Layered translucent plates: depth without weight. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2"
        style={{ perspective: '560px' }}
      >
        {/* The float sits on a plain div: the outer element's transform belongs
            to the pointer parallax, so the two must not share it. */}
        <motion.div className="relative h-full w-full" style={{ ...plateTilt, transformStyle: 'preserve-3d' }}>
          <div className="relative h-full w-full" style={still ? undefined : bobStyle(4, 11, 0.3)}>
          {CORE_PLATES.map((plate) => (
            <div
              key={plate.depth}
              className="absolute left-1/2 top-1/2 h-full w-full rounded-[1.6rem] border border-white/75 bg-[linear-gradient(150deg,rgba(255,255,255,0.86),rgba(255,255,255,0.3))] shadow-[0_24px_46px_-26px_rgba(35,23,70,0.5)] backdrop-blur-[2px]"
              style={{
                transform: `translate(-50%, -50%) rotateX(${plate.tilt}deg) rotateZ(${plate.spin}deg) translateY(${plate.shift}px) translateZ(${plate.depth}px)`,
              }}
            />
          ))}
          </div>
        </motion.div>
      </div>

      {/* Services into insight. Thin, dashed, barely moving. */}
      <motion.svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
        style={linkDrift}
      >
        <defs>
          <linearGradient id="service-core-link" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a380ed" />
            <stop offset="0.55" stopColor="#5a3dbd" />
            <stop offset="1" stopColor="#67e8f9" />
          </linearGradient>
        </defs>

        {layout.map((node, index) => {
          const isLit = litId === node.id;
          return (
            <motion.path
              key={node.id}
              d={node.d}
              stroke={isLit ? 'url(#service-core-link)' : 'rgba(90,61,189,0.24)'}
              strokeWidth={isLit ? 0.6 : 0.3}
              strokeDasharray={isLit ? '1.6 1.7' : '0.9 2.6'}
              strokeLinecap="round"
              initial={still ? false : { opacity: 0 }}
              animate={{ opacity: litId && !isLit ? 0.45 : 1 }}
              transition={{
                duration: 0.7,
                delay: still ? 0 : (litId ? 0 : 0.3 + index * 0.09),
                ease: 'easeOut',
              }}
            />
          );
        })}

        {CORE_FLOWS.map((flow) => {
          const track = byId[flow.from].track;
          return (
            <motion.g
              key={flow.from}
              initial={{ x: track.xs[0], y: track.ys[0] }}
              animate={still ? { x: track.xs[0], y: track.ys[0] } : { x: track.xs, y: track.ys }}
              transition={still ? {} : { duration: flow.duration, repeat: Infinity, ease: 'linear' }}
            >
              <circle r="0.55" fill={flow.color} />
            </motion.g>
          );
        })}
      </motion.svg>

      {/* The insight core: a small orb with a quiet WI mark. */}
      <div
        className={`absolute left-1/2 top-1/2 z-40 ${scale.core} -translate-x-1/2 -translate-y-1/2`}
      >
        <motion.div className="relative h-full w-full" style={{ ...coreTilt, perspective: '760px' }}>
          <motion.span
            aria-hidden="true"
            className="absolute -inset-8 rounded-full"
            style={{ background: CORE_GLOW, x: glowX, y: glowY }}
            animate={glowBreath}
          />

          <motion.div
            className="absolute inset-0"
            initial={still ? false : { opacity: 0, scale: 0.84 }}
            animate={coreBreath}
          >
            <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background: CORE_ORB,
                  boxShadow:
                    'inset 0 0 22px rgba(255,255,255,0.72), inset -6px -8px 20px rgba(79,92,190,0.26), 0 22px 40px -18px rgba(35,23,70,0.55)',
                }}
              />
              <span aria-hidden="true" className="absolute inset-0 rounded-full border border-white/70" />
              <span
                aria-hidden="true"
                className="absolute left-[21%] top-[15%] h-5 w-5 rounded-full bg-white/85 blur-[2px]"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-[22%] right-[15%] h-3 w-3 rounded-full bg-white/40 blur-[2px]"
              />

              <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 24 24" fill="none">
                <g
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.72"
                >
                  <path d="M4 8.6 6.4 15.6 8.7 10.3 11 15.6 13.4 8.6" />
                  <path d="M17.4 8.6v7M15.9 8.6h3M15.9 15.6h3" />
                </g>
              </svg>
            </div>

            {/* the one bright point that says "insight" */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 translate-x-[3px] rounded-full bg-[#67e8f9] shadow-[0_0_12px_3px_rgba(103,232,249,0.5)]"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* The services themselves. Hover or tap lights one up. */}
      {layout.map((node, index) => {
        const isLit = litId === node.id;
        const dimmed = Boolean(litId) && !isLit;

        return (
          <div
            key={node.id}
            className="absolute z-50 flex flex-col items-center"
            style={{ left: `${node.point.x}%`, top: `${node.point.y}%`, transform: 'translate(-50%, -50%)' }}
            onPointerEnter={() => setHoverId(node.id)}
            onPointerLeave={() => setHoverId(null)}
            onFocus={() => setHoverId(node.id)}
            onBlur={() => setHoverId(null)}
          >
            <div style={still ? undefined : bobStyle(node.lift, node.duration, node.delay)}>
              <motion.div
                className="flex flex-col items-center"
                style={nodeParallax[index]}
              >
              <motion.button
                type="button"
                aria-label={node.label}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveId((current) => (current === node.id ? null : node.id));
                }}
                className={`grid ${scale.tile} place-items-center border bg-[linear-gradient(150deg,rgba(255,255,255,0.97),rgba(255,255,255,0.62))] backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a380ed]/70 shadow-[0_14px_30px_-18px_rgba(35,23,70,0.5)] ${
                  isLit
                    ? 'border-[#a380ed]/70 text-[#4a2fa8] ring-2 ring-[#a380ed]/30'
                    : 'border-white/85 text-[#5a3dbd]'
                }`}
                initial={still ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: dimmed ? 0.55 : 1, scale: isLit ? 1.09 : 1 }}
                whileTap={still ? undefined : { scale: 0.95 }}
                transition={{ duration: 0.45, delay: still ? 0 : 0.2 + index * 0.08, ease: 'easeOut' }}
              >
                <CoreGlyph name={node.glyph} className={scale.icon} strokeWidth={isLit ? 1.45 : 1.15} />
              </motion.button>

              <span
                className={`mt-1.5 whitespace-nowrap font-[gilroy] font-semibold uppercase transition-colors duration-300 ${scale.label} ${
                  isLit ? 'text-[#4a2fa8]' : 'text-zinc-600'
                }`}
              >
                {node.label}
              </span>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ServicePage1 = () => {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef(null);

  /* Same reason as the Home hero: the centerpiece kept all of its loops alive
   * for the whole time the tab was open, so the page paid for them while the
   * visitor was already reading the service list and the pricing table. They
   * now exist only while the hero can actually be seen. */
  const heroInView = useInView(heroRef, { initial: true, margin: '120px 0px' });
  const still = shouldReduceMotion || !heroInView;

  const scrollToServices = (event) => {
    const target = document.getElementById('services');
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="w-full bg-services">
      <section
        ref={heroRef}
        aria-labelledby="services-hero-title"
        className="relative isolate flex min-h-[clamp(38rem,94svh,54rem)] w-full flex-col justify-center overflow-hidden bg-white px-4 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16 lg:px-16 lg:pb-24 lg:pt-20 lg:-mt-9"
      >
        {/* The grid and the two light pools are static. They used to drift and
            breathe on top of a 64px blur filter, which meant re-rasterising a
            30rem blurred layer every frame for the whole session. A radial
            gradient that already fades to transparent needs no blur, so the
            glow is kept and the filter is not. */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-[12%] opacity-90" style={HERO_GRID} />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[12rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(163,128,237,0.30),transparent_62%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10rem] bottom-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(79,139,255,0.24),transparent_64%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply"
          style={{ backgroundImage: HERO_NOISE }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center">
          <div className="grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <motion.div
                className="flex items-center gap-3"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#a380ed]" />
                <span className="font-[gilroy] text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:text-[11px]">
                  We Insightians — Services
                </span>
              </motion.div>

              <h1
                id="services-hero-title"
                className="mt-6 max-w-[15ch] font-[larken] text-[2.5rem] leading-[1.02] tracking-[-0.02em] text-[#171126] sm:mt-8 sm:text-6xl lg:text-7xl"
              >
                {['Services that turn', 'ideas into '].map((line, index) => (
                  <span key={line} className="block overflow-hidden pb-[0.06em]">
                    <motion.span
                      className="block"
                      initial={shouldReduceMotion ? false : { y: '108%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, delay: shouldReduceMotion ? 0 : 0.12 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
                <span className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block text-[#5a3dbd]"
                    initial={shouldReduceMotion ? false : { y: '108%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: shouldReduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    impact.
                  </motion.span>
                </span>
              </h1>

              <motion.p
                className="mt-6 font-[gilroy] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5a3dbd] sm:mt-8 sm:text-xs"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.42, ease: 'easeOut' }}
              >
                Design + Technology + Growth
              </motion.p>

              <motion.p
                className="mt-4 max-w-xl font-[gilroy] text-sm leading-relaxed text-zinc-600 sm:mt-5 sm:text-base"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
              >
                We build the thinking and the making behind strong digital brands — interfaces, platforms and campaigns engineered
                to compound. Every engagement connects design craft, dependable technology and measurable growth in one team.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-5 sm:mt-10"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.58, ease: 'easeOut' }}
              >
                <Button href="#services" onClick={scrollToServices} arrow>
                  Explore services
                </Button>

                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center gap-2 font-[gilroy] text-sm font-semibold text-[#231746] transition-colors duration-300 hover:text-[#7c5cdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-2"
                >
                  Start a project
                  <span aria-hidden="true" className="block h-px w-8 bg-zinc-400 transition-all duration-500" />
                </Link>

              </motion.div>
            </div>

            <div className="lg:col-span-5">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <HeroCenterpiece still={still} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="services-intro-title" className="w-full px-4 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="min-w-0 md:max-w-3xl">
              <p className="mb-5 text-zinc-500">
                <span aria-hidden="true" className="text-black">•</span> Strategy, design, technology, and growth
              </p>
              <h2 id="services-intro-title" className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
                From first idea to lasting growth, our services cover the full digital journey
              </h2>
            </div>

            <div className="shrink-0">
              <Link
                to="/contact"
                className="group inline-flex min-h-11 items-center text-left text-base font-[gilroy] transition-colors hover:text-[#7c5cdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-4 sm:text-lg"
              >
                <span>Start your project with us today</span>
                <span aria-hidden="true" className="ml-4 block h-px w-10 bg-zinc-500 transition-all duration-500 group-hover:w-20 group-focus-visible:w-20"></span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="mt-16 h-px w-full origin-left bg-zinc-400"
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          ></motion.div>
        </div>
      </section>

      <OurServices2 />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default ServicePage1;
