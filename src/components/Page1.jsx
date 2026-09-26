import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import Button from './Button.jsx'

const HERO_GRID = {
  backgroundImage:
    'linear-gradient(to right, rgba(90, 61, 189, 0.075) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 139, 255, 0.075) 1px, transparent 1px)',
  backgroundSize: '58px 58px',
}

const HERO_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")"

const easeSoft = [0.45, 0, 0.55, 1]

/* ------------------------------------------------------------------ *
 * We Insightians — Digital Insight Engine
 * IDEA -> INSIGHT -> DESIGN / TECHNOLOGY / MARKETING -> GROWTH
 * Nine real capabilities feed one central Insight Core.
 * ------------------------------------------------------------------ */

const CORE_POINT = { x: 50, y: 50 }

const RING_RADIUS = { inner: 15.5, middle: 25.5, outer: 35.5 }

const buildRingMeta = (radius) => [
  { radius: radius.inner, dash: '0.9 2.5', spin: 190, width: 0.2, opacity: 0.4, tier: 'all' },
  { radius: radius.middle, dash: '1.5 3.3', spin: -250, width: 0.22, opacity: 0.32, tier: 'all' },
  { radius: radius.outer, dash: '2.1 4.4', spin: 320, width: 0.2, opacity: 0.24, tier: 'sm' },
]

const RING_META = buildRingMeta(RING_RADIUS)

const TIER_CLASS = { all: '', sm: 'hidden sm:block' }

const CHIP = {
  inner: {
    box: 'h-11 w-11 rounded-[1.15rem]',
    icon: 'h-[19px] w-[19px]',
    label: 'text-[8.5px] tracking-[0.16em]',
    shadow: 'shadow-[0_16px_34px_-18px_rgba(35,23,70,0.55)]',
  },
  middle: {
    box: 'h-10 w-10 rounded-[1.05rem]',
    icon: 'h-[17px] w-[17px]',
    label: 'text-[8px] tracking-[0.15em]',
    shadow: 'shadow-[0_14px_30px_-18px_rgba(35,23,70,0.5)]',
  },
  outer: {
    box: 'h-9 w-9 rounded-[0.95rem]',
    icon: 'h-4 w-4',
    label: 'text-[7.5px] tracking-[0.14em]',
    shadow: 'shadow-[0_12px_26px_-18px_rgba(35,23,70,0.45)]',
  },
}

/*
 * Three interleaved orbits with 120 degree rotational symmetry. Each ring sits
 * 20 degrees ahead of / behind the next, so the repeating gap pattern around
 * the circle is 20 / 46 / 54 degrees. That keeps every chip + label clear of its
 * neighbours at 288px through 480px while staying visually deliberate.
 */
const SERVICE_NODES = [
  { id: 'web-design', label: 'Web Design', full: 'Web Design', glyph: 'window', ring: 'inner', angle: 154, tier: 'all', tagline: 'SHAPE • STRUCTURE • STYLE', lift: 5, duration: 8.6, delay: 0.2 },
  { id: 'ui-ux', label: 'UI/UX Design', full: 'UI/UX Design', glyph: 'layers', ring: 'inner', angle: 274, tier: 'sm', tagline: 'CLARITY • FLOW • ADOPTION', lift: 6, duration: 9.4, delay: 1.1 },
  { id: 'branding', label: 'Branding', full: 'Branding', glyph: 'mark', ring: 'inner', angle: 34, tier: 'sm', tagline: 'POSITION • VOICE • IDENTITY', lift: 5, duration: 7.8, delay: 0.6 },
  { id: 'web-development', label: 'Web Development', full: 'Web Development', glyph: 'code', ring: 'middle', angle: 340, tier: 'all', tagline: 'BUILD • SCALE • INTEGRATE', lift: 7, duration: 10.2, delay: 0.9 },
  { id: 'ecommerce', label: 'E-commerce', full: 'E-commerce Development', glyph: 'bag', ring: 'middle', angle: 100, tier: 'sm', tagline: 'DISCOVER • CONVERT • RETAIN', lift: 8, duration: 8.8, delay: 1.6 },
  { id: 'ai', label: 'AI Solutions', full: 'AI Solutions', glyph: 'network', ring: 'middle', angle: 220, tier: 'all', tagline: 'AUTOMATE • ASSIST • INFORM', lift: 7, duration: 11.2, delay: 1.3 },
  { id: 'seo', label: 'SEO & Marketing', full: 'SEO & Digital Marketing', glyph: 'search', ring: 'outer', angle: 54, tier: 'all', tagline: 'FOUND • RANK • DEMAND', lift: 10, duration: 9.6, delay: 0.4 },
  { id: 'social', label: 'Social Media', full: 'Social Media Management', glyph: 'share', ring: 'outer', angle: 174, tier: 'sm', tagline: 'REACH • ENGAGE • COMMUNITY', lift: 11, duration: 12.4, delay: 1.9 },
  { id: 'performance', label: 'Performance', full: 'Performance Marketing', glyph: 'target', ring: 'outer', angle: 294, tier: 'all', tagline: 'MEASURE • OPTIMISE • SCALE', lift: 10, duration: 10.8, delay: 2.2 },
]

const FLOW_LINKS = [
  { id: 'flow-1', from: 'web-development', color: '#67e8f9', duration: 13 },
  { id: 'flow-2', from: 'seo', color: '#a380ed', duration: 17 },
  { id: 'flow-3', from: 'ui-ux', color: '#4f8bff', duration: 15 },
  { id: 'flow-4', from: 'ecommerce', color: '#67e8f9', duration: 19 },
]

const polarPoint = (radius, angle) => {
  const rad = (angle * Math.PI) / 180
  return { x: CORE_POINT.x + radius * Math.cos(rad), y: CORE_POINT.y + radius * Math.sin(rad) }
}

const cubicAt = (t, a, b, c, d) => {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

const LINK_SAMPLES = 26

/* One link from any point into the core. Control points, path data and the
 * particle track are resolved together so the circular composition and the
 * mobile stack share exactly the same curve language. */
const createCoreLink = (point, bow) => {
  const dx = CORE_POINT.x - point.x
  const dy = CORE_POINT.y - point.y
  const length = Math.hypot(dx, dy) || 1
  const bend = length * bow
  const ox = (-dy / length) * bend
  const oy = (dx / length) * bend
  const c1 = { x: point.x + dx * 0.36 + ox, y: point.y + dy * 0.36 + oy }
  const c2 = { x: point.x + dx * 0.76 + ox * 0.42, y: point.y + dy * 0.76 + oy * 0.42 }

  const xs = []
  const ys = []
  for (let step = 0; step <= LINK_SAMPLES; step += 1) {
    const t = step / LINK_SAMPLES
    xs.push(cubicAt(t, point.x, c1.x, c2.x, CORE_POINT.x))
    ys.push(cubicAt(t, point.y, c1.y, c2.y, CORE_POINT.y))
  }

  return {
    c1,
    c2,
    d: `M${point.x.toFixed(2)} ${point.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${CORE_POINT.x} ${CORE_POINT.y}`,
    track: { xs, ys },
  }
}

const LINK_BOW = { inner: 0.5, middle: 0.6, outer: 0.68 }

/* Node positions, bezier links and particle tracks are resolved once. */
const buildServiceLayout = (radius) =>
  SERVICE_NODES.map((node, index) => {
    const point = polarPoint(radius[node.ring], node.angle)

    return {
      ...node,
      index,
      point,
      ...createCoreLink(point, LINK_BOW[node.ring]),
      side: Math.cos((node.angle * Math.PI) / 180),
    }
  })

const SERVICE_LAYOUT = buildServiceLayout(RING_RADIUS)

const indexById = (layout) =>
  layout.reduce((accumulator, node) => {
    accumulator[node.id] = node
    return accumulator
  }, {})

const LAYOUT_BY_ID = indexById(SERVICE_LAYOUT)

/* Pointer tracking stays, but mobile gets a fraction of the desktop amplitude. */
const dampPointer = (value) => value * 0.42

/* Desktop keeps the full orbital composition from lg upward. Below lg the
 * ecosystem becomes the square WI Insight Stack instead of a shrunken circle. */
const DESKTOP_QUERY = '(min-width: 1024px)'

const useDesktopEngine = () => {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const sync = (event) => setDesktop(event.matches)
    query.addEventListener('change', sync)
    setDesktop(query.matches)
    return () => query.removeEventListener('change', sync)
  }, [])

  return desktop
}

/* ------------------------------------------------------------------ *
 * WI INSIGHT STACK — the mobile composition.
 * Same ecosystem, square geometry: layered plates, one core, six
 * hero-scale services, shared palette, icons and animation language.
 * ------------------------------------------------------------------ */

const STACK_GRID = {
  backgroundImage:
    'linear-gradient(to right, rgba(90, 61, 189, 0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 139, 255, 0.10) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

/* Six of the nine capabilities stay visible on mobile. The other three keep
 * their place in SERVICE_NODES, the Services section and services.js — this is
 * a visual reduction of the hero, never a removal of data. */
const STACK_SLOTS = [
  { id: 'web-design', x: 26, y: 15, short: 'Web Design', bow: 0.3 },
  { id: 'ui-ux', x: 74, y: 15, short: 'UI/UX', bow: 0.3 },
  { id: 'web-development', x: 16, y: 50, short: 'Web Dev', bow: 0.34 },
  { id: 'ai', x: 82, y: 50, short: 'AI Solutions', bow: 0.34 },
  { id: 'ecommerce', x: 26, y: 85, short: 'E-commerce', bow: 0.3 },
  { id: 'seo', x: 74, y: 85, short: 'SEO & Marketing', bow: 0.3 },
]

/* One tile size for the whole stack, taken from the desktop inner tier so the
 * chip-to-core ratio stays identical in both compositions. */
const STACK_CHIP = CHIP.inner

/* Links leave the tile itself, not the caption underneath it. */
const STACK_CHIP_RISE = 3.4

const STACK_NODES = STACK_SLOTS.map((slot, index) => {
  const source = LAYOUT_BY_ID[slot.id]
  const point = { x: slot.x, y: slot.y - STACK_CHIP_RISE }

  return { ...source, index, slot, short: slot.short, ...createCoreLink(point, slot.bow) }
})

const STACK_FLOWS = [
  { id: 'stack-flow-1', from: 2, color: '#67e8f9', duration: 8 },
  { id: 'stack-flow-2', from: 3, color: '#a380ed', duration: 11 },
  { id: 'stack-flow-3', from: 5, color: '#4f8bff', duration: 9 },
]

const STACK_PLATES = [
  { depth: 0, shift: 15 },
  { depth: 22, shift: 0 },
  { depth: 44, shift: -15 },
]

const ServiceGlyph = ({ name, className = '' }) => {
  const shared = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.15,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }

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
    share: (
      <>
        <circle cx="6.3" cy="12" r="2.4" />
        <circle cx="17.1" cy="6.3" r="2.4" />
        <circle cx="17.1" cy="17.7" r="2.4" />
        <path d="M8.5 10.9 14.9 7.4M8.5 13.1l6.4 3.5" />
      </>
    ),
    mark: (
      <>
        <path d="M4.9 7.6a2.9 2.9 0 0 1 2.9-2.9h8.4a2.9 2.9 0 0 1 2.9 2.9v8.8a2.9 2.9 0 0 1-2.9 2.9H7.8a2.9 2.9 0 0 1-2.9-2.9z" />
        <path d="M8.4 15.6 12 9.2l3.6 6.4" />
        <path d="M9.9 13.3h4.2" />
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
    target: (
      <>
        <circle cx="10.8" cy="13.2" r="7.4" />
        <circle cx="10.8" cy="13.2" r="3.5" />
        <path d="M10.8 13.2 20.4 4.6" />
        <path d="M15.9 4.6h4.5v4.5" />
      </>
    ),
  }

  return <svg {...shared}>{shapes[name]}</svg>
}

const CoreSphere = ({ still, active, orbRef, orbRotate, dotX, dotY }) => {
  const coreMotion = still
    ? { scale: active ? 1.035 : 1, transition: { duration: 0.5, ease: easeSoft } }
    : {
        scale: active ? [1, 1.05, 1] : [0.99, 1.015, 0.99],
        transition: { duration: active ? 7 : 12, repeat: Infinity, ease: easeSoft },
      }

  const haloMotion = still
    ? { opacity: active ? 1 : 0.8, transition: { duration: 0.5 } }
    : { opacity: [0.74, 1, 0.74], transition: { duration: 11, repeat: Infinity, ease: easeSoft } }

  return (
    <motion.div ref={orbRef} className="relative h-full w-full" style={orbRotate} animate={coreMotion}>
      <motion.span
        aria-hidden="true"
        className="absolute -inset-4 rounded-full sm:-inset-5"
        style={{ background: 'radial-gradient(closest-side, rgba(163,128,237,0.3), rgba(255,255,255,0.1) 62%, rgba(255,255,255,0) 78%)' }}
        animate={haloMotion}
      />

      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 33% 27%, #ffffff 0%, #f1eafd 17%, #cdb8f6 43%, #a380ed 66%, #6d4fd6 85%, #4f8bff 100%)',
          boxShadow: 'inset 0 0 22px rgba(255,255,255,0.72), inset -6px -8px 20px rgba(79,92,190,0.26), 0 22px 40px -18px rgba(35,23,70,0.55)',
        }}
      />
      <span aria-hidden="true" className="absolute inset-0 rounded-full border border-white/70" />
      <span aria-hidden="true" className="absolute left-[21%] top-[15%] h-5 w-5 rounded-full bg-white/85 blur-[2px]" />
      <span aria-hidden="true" className="absolute bottom-[22%] right-[15%] h-3 w-3 rounded-full bg-white/40 blur-[2px]" />

      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 24 24" fill="none">
        <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.66">
          <path d="M4 8.6 6.4 15.6 8.7 10.3 11 15.6 13.4 8.6" />
          <path d="M17.4 8.6v7M15.9 8.6h3M15.9 15.6h3" />
        </g>
      </svg>

      <motion.svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        animate={still ? {} : { rotate: 360, transition: { duration: 72, repeat: Infinity, ease: 'linear' } }}
        style={{ originX: '12px', originY: '12px' }}
      >
        {Array.from({ length: 12 }).map((_, tick) => (
          <line
            key={tick}
            x1="12"
            y1="1.2"
            x2="12"
            y2="3"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="0.8"
            strokeLinecap="round"
            transform={`rotate(${tick * 30} 12 12)`}
          />
        ))}
      </motion.svg>

      <motion.span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-[#67e8f9] shadow-[0_0_12px_3px_rgba(103,232,249,0.5)]"
        style={{ x: dotX, y: dotY }}
      />
    </motion.div>
  )
}

const InsightCore = ({ still, engineRef, coreTilt, orbRotate, plateRotate, dotX, dotY, haloX, haloY, plateLayers, active }) => {
  const haloMotion = still
    ? { opacity: active ? 1 : 0.8, transition: { duration: 0.5 } }
    : { opacity: [0.74, 1, 0.74], transition: { duration: 11, repeat: Infinity, ease: easeSoft } }

  return (
    <motion.div className="relative h-full w-full" style={{ ...coreTilt, perspective: '920px' }}>
      <motion.span
        aria-hidden="true"
        className="absolute -inset-8 rounded-full sm:-inset-10"
        style={{
          background: 'radial-gradient(closest-side, rgba(163,128,237,0.34), rgba(79,139,255,0.16) 54%, rgba(103,232,249,0) 76%)',
          x: haloX,
          y: haloY,
        }}
        animate={haloMotion}
      />

      <motion.div aria-hidden="true" className="absolute inset-x-0 top-[56%] h-0" style={plateRotate}>
        {plateLayers.map((layer) => (
          <div
            key={layer.depth}
            className="absolute left-1/2 top-1/2 h-36 w-36 rounded-[1.5rem] border border-white/70 bg-[linear-gradient(150deg,rgba(255,255,255,0.78),rgba(255,255,255,0.3))] shadow-[0_26px_54px_-28px_rgba(35,23,70,0.5)] backdrop-blur-[2px] sm:h-44 sm:w-44"
            style={{ transform: `translate(-50%, -50%) rotateX(58deg) rotateZ(-26deg) translateY(${layer.shift}px) translateZ(${layer.depth}px)` }}
          />
        ))}
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-52 w-52 sm:h-64 sm:w-64"
        style={{ transform: 'translate(-50%, -50%) rotateX(72deg)' }}
      >
        <motion.div
          className="relative h-full w-full rounded-full border border-dashed border-[#5a3dbd]/20"
          animate={still ? {} : { rotate: 360, transition: { duration: 44, repeat: Infinity, ease: 'linear' } }}
        >
          <i className="absolute left-1/2 top-[-2px] h-1 w-1 -translate-x-1/2 rounded-full bg-[#67e8f9]/70" />
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-60 w-60 sm:h-72 sm:w-72"
        style={{ transform: 'translate(-50%, -50%) rotateX(-64deg) rotateZ(18deg)' }}
      >
        <motion.div
          className="relative h-full w-full rounded-full border border-dashed border-[#a380ed]/20"
          animate={still ? {} : { rotate: -360, transition: { duration: 62, repeat: Infinity, ease: 'linear' } }}
        >
          <i className="absolute left-1/2 top-[-2px] h-1 w-1 -translate-x-1/2 rounded-full bg-[#a380ed]/70" />
        </motion.div>
      </div>

      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 sm:h-24 sm:w-24">
        <CoreSphere still={still} active={active} orbRef={engineRef} orbRotate={orbRotate} dotX={dotX} dotY={dotY} />
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ *
 * Desktop — the circular / orbital WI ecosystem. Rendered from lg up and
 * kept exactly as it was: same geometry, same plates, same hover story.
 * ------------------------------------------------------------------ */
const DesktopInsightEngine = ({ shouldReduceMotion, engineRef, nodeParallax, engineStyle, plateRotate, orbRotate, dotX, dotY, plateLayers }) => {
  const still = shouldReduceMotion
  const [active, setActive] = useState(null)

  const layout = SERVICE_LAYOUT
  const layoutById = LAYOUT_BY_ID
  const ringMeta = RING_META

  const coreTilt = { rotateX: engineStyle.rotateX, rotateY: engineStyle.rotateY }
  const haloX = useTransform(dotX, [-26, 26], [-9, 9])
  const haloY = useTransform(dotY, [-26, 26], [-9, 9])

  const nodeMotion = (node, dimmed) => {
    const opacity = dimmed ? 0.42 : 1
    if (still) return { opacity, transition: { duration: 0.35, ease: easeSoft } }
    return {
      opacity,
      y: [0, -node.lift, 0],
      transition: {
        opacity: { duration: 0.35, ease: easeSoft },
        y: { duration: node.duration, delay: node.delay, repeat: Infinity, ease: easeSoft },
      },
    }
  }

  return (
    <div className="relative mx-auto aspect-square w-[min(100%,24rem)] sm:w-[min(100%,30rem)] lg:w-[min(100%,40rem)]">
      <div
        aria-hidden="true"
        className="absolute inset-x-[12%] bottom-[3%] h-12 rounded-[50%] bg-[radial-gradient(closest-side,rgba(35,23,70,0.2),transparent)] blur-lg"
      />

      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="wis-link" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a380ed" />
            <stop offset="0.55" stopColor="#5a3dbd" />
            <stop offset="1" stopColor="#67e8f9" />
          </linearGradient>
        </defs>

        {ringMeta.map((ring) => (
          <motion.circle
            key={ring.radius}
            cx={CORE_POINT.x}
            cy={CORE_POINT.y}
            r={ring.radius}
            className={TIER_CLASS[ring.tier]}
            stroke="rgba(90,61,189,0.55)"
            strokeWidth={ring.width}
            strokeDasharray={ring.dash}
            strokeLinecap="round"
            opacity={ring.opacity}
            animate={still ? {} : { rotate: 360, transition: { duration: ring.spin, repeat: Infinity, ease: 'linear' } }}
            style={{ originX: '50px', originY: '50px' }}
          />
        ))}

        {layout.map((node) => {
          const isActive = active === node.id
          return (
            <g key={node.id} className={TIER_CLASS[node.tier]}>
              <motion.path
                d={node.d}
                stroke={isActive ? 'url(#wis-link)' : 'rgba(90,61,189,0.34)'}
                strokeWidth={isActive ? 0.62 : 0.3}
                strokeDasharray={isActive ? '1.5 1.8' : '0.9 2.4'}
                strokeLinecap="round"
                opacity={active && !isActive ? 0.35 : 1}
                animate={
                  still
                    ? {}
                    : {
                        strokeDashoffset: [0, -3.3],
                        opacity: active && !isActive ? 0.3 : 1,
                        transition: {
                          strokeDashoffset: { duration: isActive ? 3.4 : 12 + node.index * 0.9, repeat: Infinity, ease: 'linear' },
                          opacity: { duration: 0.35 },
                        },
                      }
                }
              />
              <circle cx={node.c2.x} cy={node.c2.y} r="0.42" fill={isActive ? '#67e8f9' : 'rgba(90,61,189,0.4)'} opacity={isActive ? 0.9 : 0.55} />
            </g>
          )
        })}

        {FLOW_LINKS.map((flow) => (
          <motion.circle
            key={flow.id}
            className={TIER_CLASS[layoutById[flow.from].tier]}
            r="0.6"
            fill={flow.color}
            animate={still ? {} : { cx: layoutById[flow.from].track.xs, cy: layoutById[flow.from].track.ys }}
            transition={still ? {} : { duration: flow.duration, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <motion.div className="relative h-60 w-60 max-sm:scale-[0.82] sm:h-72 sm:w-72">
          <InsightCore
            still={still}
            engineRef={engineRef}
            coreTilt={coreTilt}
            orbRotate={orbRotate}
            plateRotate={plateRotate}
            dotX={dotX}
            dotY={dotY}
            haloX={haloX}
            haloY={haloY}
            plateLayers={plateLayers}
            active={Boolean(active)}
          />
        </motion.div>
      </div>

      {layout.map((node) => {
        const chip = CHIP[node.ring]
        const isActive = active === node.id
        const anchor =
          node.side < -0.3
            ? { transform: 'translateX(12px)', textAlign: 'left', alignItems: 'flex-start' }
            : node.side > 0.3
              ? { transform: 'translateX(calc(-100% - 12px))', textAlign: 'right', alignItems: 'flex-end' }
              : { transform: 'translateX(-50%)', textAlign: 'center', alignItems: 'center' }

        return (
          <div
            key={node.id}
            className={`absolute ${TIER_CLASS[node.tier]} flex flex-col items-center`}
            style={{ left: `${node.point.x}%`, top: `${node.point.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              className="flex flex-col items-center"
              animate={nodeMotion(node, Boolean(active) && !isActive)}
            >
              <motion.div
                className="flex flex-col items-center"
                style={nodeParallax[node.index]}
                onPointerEnter={() => setActive(node.id)}
                onPointerLeave={() => setActive((current) => (current === node.id ? null : current))}
              >
              <motion.button
                type="button"
                aria-label={`${node.full} — ${node.tagline.split(' • ').join(', ').toLowerCase()}`}
                className={`grid ${chip.box} place-items-center border bg-[linear-gradient(150deg,rgba(255,255,255,0.97),rgba(255,255,255,0.62))] backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a380ed]/70 ${chip.shadow} ${
                  isActive ? 'border-[#a380ed]/70 text-[#4a2fa8] ring-2 ring-[#a380ed]/35' : 'border-white/85 text-[#5a3dbd]'
                }`}
                whileHover={still ? undefined : { scale: 1.12 }}
                whileTap={still ? undefined : { scale: 0.96 }}
                animate={{ y: isActive ? -2 : 0 }}
                transition={{ duration: 0.4, ease: easeSoft }}
              >
                <ServiceGlyph name={node.glyph} className={chip.icon} />
              </motion.button>

              <span
                className={`mt-1.5 whitespace-nowrap font-[gilroy] font-semibold uppercase transition-colors duration-300 ${chip.label} ${
                  isActive ? 'text-[#4a2fa8]' : 'text-[#4b3a76]/70'
                }`}
              >
                {node.label}
              </span>

              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1" style={anchor}>
                <motion.span
                  className="flex flex-col gap-0.5 whitespace-nowrap"
                  style={anchor}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -4 }}
                  transition={{ duration: 0.35, ease: easeSoft }}
                >
                  <span className="font-[gilroy] text-[7.5px] font-semibold uppercase tracking-[0.16em] text-[#4a2fa8] sm:text-[8px] sm:tracking-[0.2em]">
                    {node.full}
                  </span>
                  <span className="font-[gilroy] text-[6.5px] font-medium uppercase tracking-[0.14em] text-[#6b7a99] sm:text-[7px] sm:tracking-[0.16em]">
                    {node.tagline}
                  </span>
                </motion.span>
              </span>
              </motion.div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Mobile — the WI INSIGHT STACK. Below lg the orbital circle becomes a
 * compact layered square: three glass plates, one core, six services,
 * same colours, same glyphs, same motion language. Nothing is scaled
 * down from the desktop, the geometry is re-authored.
 * ------------------------------------------------------------------ */
const MobileInsightEngine = ({ shouldReduceMotion, engineRef, engineStyle, plateRotate, orbRotate, dotX, dotY }) => {
  const still = shouldReduceMotion
  const [active, setActive] = useState(null)

  /* Pointer follow exists but only whispers on touch. */
  const coreTilt = {
    rotateX: useTransform(engineStyle.rotateX, dampPointer),
    rotateY: useTransform(engineStyle.rotateY, dampPointer),
  }
  const plateTilt = { rotateZ: useTransform(plateRotate.rotateZ, dampPointer) }
  const orbShift = { x: useTransform(orbRotate.x, dampPointer), y: useTransform(orbRotate.y, dampPointer) }
  const coreDot = { x: useTransform(dotX, dampPointer), y: useTransform(dotY, dampPointer) }
  const haloX = useTransform(coreDot.x, [-11, 11], [-3, 3])
  const haloY = useTransform(coreDot.y, [-6.6, 6.6], [-2, 2])

  const activeNode = STACK_NODES.find((node) => node.id === active) || null

  const nodeMotion = (node, dimmed, isActive) => {
    const opacity = dimmed ? 0.45 : 1
    if (still) return { opacity, scale: isActive ? 1.07 : 1, transition: { duration: 0.4, ease: easeSoft } }
    return {
      opacity,
      scale: isActive ? 1.07 : 1,
      y: [0, -node.lift * 0.4, 0],
      transition: {
        opacity: { duration: 0.35, ease: easeSoft },
        scale: { duration: 0.45, ease: easeSoft },
        y: { duration: node.duration * 0.8, delay: node.delay * 0.4, repeat: Infinity, ease: easeSoft },
      },
    }
  }

  return (
    <div
      ref={engineRef}
      onClick={() => setActive(null)}
      className="relative mx-auto aspect-square w-[min(85vw,28rem)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[12%] bottom-[3%] h-9 rounded-[50%] bg-[radial-gradient(closest-side,rgba(35,23,70,0.2),transparent)] blur-lg"
      />

      {/* Two upright glass panels */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1.5%] z-10 rounded-[2.4rem] border border-white/80 bg-[linear-gradient(158deg,rgba(255,255,255,0.94),rgba(226,216,252,0.5)_48%,rgba(206,231,255,0.56))] shadow-[0_38px_74px_-40px_rgba(35,23,70,0.6)] backdrop-blur-[3px]"
        animate={
          still
            ? { rotate: -2.5 }
            : { y: [0, -5, 0], rotate: [-2.5, -1.1, -2.5], transition: { duration: 13, repeat: Infinity, ease: easeSoft } }
        }
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6.5%] z-10 overflow-hidden rounded-[1.85rem] border border-white/70 bg-[linear-gradient(150deg,rgba(255,255,255,0.8),rgba(238,232,255,0.4)_52%,rgba(215,238,255,0.46))] shadow-[0_26px_56px_-34px_rgba(35,23,70,0.5)] backdrop-blur-[2px]"
        animate={
          still
            ? { rotate: 2 }
            : { y: [0, 6, 0], rotate: [2, 3.3, 2], transition: { duration: 16, delay: 0.8, repeat: Infinity, ease: easeSoft } }
        }
      >
        <div className="absolute inset-0 opacity-70" style={STACK_GRID} />
        <div className="absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(90,61,189,0.15),transparent_72%)]" />
      </motion.div>

      {/* Tilted 3D plates that read as the machine floor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2"
        style={{ perspective: '720px' }}
      >
        <motion.div className="relative h-full w-full" style={{ ...plateTilt, transformStyle: 'preserve-3d' }}>
          {STACK_PLATES.map((plate) => (
            <div
              key={plate.depth}
              className="absolute left-1/2 top-1/2 h-full w-full rounded-[1.5rem] border border-white/75 bg-[linear-gradient(150deg,rgba(255,255,255,0.86),rgba(255,255,255,0.34))] shadow-[0_24px_46px_-26px_rgba(35,23,70,0.5)] backdrop-blur-[2px]"
              style={{ transform: `translate(-50%, -50%) rotateX(57deg) rotateZ(-24deg) translateY(${plate.shift}px) translateZ(${plate.depth}px)` }}
            />
          ))}
        </motion.div>
      </div>

      {/* Insight frame — square instead of circular, same slow orbital read */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="relative h-full w-full rounded-[1.7rem] border border-dashed border-[#5a3dbd]/25"
          animate={still ? {} : { rotate: 360, transition: { duration: 48, repeat: Infinity, ease: 'linear' } }}
        >
          <i className="absolute left-1/2 top-[-2px] h-1 w-1 -translate-x-1/2 rounded-full bg-[#67e8f9]/75" />
        </motion.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="relative h-full w-full rounded-[1.2rem] border border-[#a380ed]/25 bg-[linear-gradient(150deg,rgba(255,255,255,0.5),rgba(226,214,255,0.2))] backdrop-blur-[2px]"
          animate={still ? {} : { rotate: -360, transition: { duration: 66, repeat: Infinity, ease: 'linear' } }}
        >
          <i className="absolute bottom-[-2px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#a380ed]/75" />
        </motion.div>
      </div>

      {/* Connection lines and travelling signal particles */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="wis-stack-link" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a380ed" />
            <stop offset="0.55" stopColor="#5a3dbd" />
            <stop offset="1" stopColor="#67e8f9" />
          </linearGradient>
        </defs>

        {STACK_NODES.map((node) => {
          const isActive = active === node.id
          return (
            <motion.path
              key={node.id}
              d={node.d}
              stroke={isActive ? 'url(#wis-stack-link)' : 'rgba(90,61,189,0.32)'}
              strokeWidth={isActive ? 0.7 : 0.34}
              strokeDasharray={isActive ? '1.6 1.7' : '0.9 2.6'}
              strokeLinecap="round"
              opacity={active && !isActive ? 0.4 : 1}
              animate={
                still
                  ? {}
                  : {
                      strokeDashoffset: [0, -3.4],
                      transition: {
                        strokeDashoffset: { duration: isActive ? 3.6 : 13 + node.index * 0.9, repeat: Infinity, ease: 'linear' },
                      },
                    }
              }
            />
          )
        })}

        {STACK_FLOWS.map((flow) => (
          <motion.circle
            key={flow.id}
            r="0.6"
            fill={flow.color}
            animate={still ? {} : { cx: STACK_NODES[flow.from].track.xs, cy: STACK_NODES[flow.from].track.ys }}
            transition={still ? {} : { duration: flow.duration, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </svg>

      {/* Floating micro-elements */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-[16%] top-[31%] z-30 flex h-3 items-end gap-[3px]"
        animate={still ? {} : { opacity: [0.4, 0.9, 0.4], transition: { duration: 5.5, repeat: Infinity, ease: easeSoft } }}
      >
        <i className="h-1 w-[3px] rounded-full bg-[#5a3dbd]/70" />
        <i className="h-2 w-[3px] rounded-full bg-[#a380ed]/80" />
        <i className="h-1.5 w-[3px] rounded-full bg-[#67e8f9]/70" />
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute right-[23%] top-[30%] z-30 h-1.5 w-1.5 rounded-full bg-[#67e8f9]/70"
        animate={still ? {} : { y: [0, -8, 0], opacity: [0.3, 0.85, 0.3], transition: { duration: 7.5, repeat: Infinity, ease: easeSoft } }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[33%] left-[30%] z-30 h-1 w-1 rounded-full bg-[#a380ed]/70"
        animate={still ? {} : { y: [0, 7, 0], opacity: [0.3, 0.8, 0.3], transition: { duration: 9, delay: 0.6, repeat: Infinity, ease: easeSoft } }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute left-[7.5%] top-[7.5%] z-30 h-4 w-4 rounded-tl-lg border-l border-t border-[#5a3dbd]/30" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-[7.5%] right-[7.5%] z-30 h-4 w-4 rounded-br-lg border-b border-r border-[#4f8bff]/30" />

      {/* The core stays the hero of the composition */}
      <div className="absolute left-1/2 top-1/2 z-40 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2">
        <motion.div className="relative h-full w-full" style={{ ...coreTilt, perspective: '760px' }}>
          <motion.span
            aria-hidden="true"
            className="absolute -inset-7 rounded-full"
            style={{
              background: 'radial-gradient(closest-side, rgba(163,128,237,0.34), rgba(79,139,255,0.16) 54%, rgba(103,232,249,0) 76%)',
              x: haloX,
              y: haloY,
            }}
            animate={still ? { opacity: active ? 1 : 0.8 } : { opacity: [0.74, 1, 0.74], transition: { duration: 11, repeat: Infinity, ease: easeSoft } }}
          />

          <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2">
            <CoreSphere
              still={still}
              active={Boolean(active)}
              orbRotate={orbShift}
              dotX={coreDot.x}
              dotY={coreDot.y}
            />
          </div>
        </motion.div>
      </div>

      {/* Readout — the core name, or the tapped capability. It sits in the
          clear band between the orb and the lower tiles. */}
      <div className="pointer-events-none absolute inset-x-0 top-[67%] z-40 flex justify-center px-3">
        <div className="relative flex h-3.5 w-full max-w-[88%] items-center justify-center">
          <motion.span
            className="absolute whitespace-nowrap rounded-full border border-[#a380ed]/25 bg-white/75 px-2 py-[3px] font-[gilroy] text-[6.5px] font-semibold uppercase tracking-[0.18em] text-[#4b3a76]/80 backdrop-blur-sm sm:text-[7.5px] sm:tracking-[0.22em]"
            animate={{ opacity: activeNode ? 0 : 1, y: activeNode ? -4 : 0 }}
            transition={{ duration: 0.3, ease: easeSoft }}
          >
            WI Insight Core
          </motion.span>
          <motion.span
            className="absolute whitespace-nowrap rounded-full border border-[#a380ed]/45 bg-white/85 px-2 py-[3px] font-[gilroy] text-[6.5px] font-semibold uppercase tracking-[0.18em] text-[#4a2fa8] backdrop-blur-sm sm:text-[7.5px] sm:tracking-[0.22em]"
            animate={{ opacity: activeNode ? 1 : 0, y: activeNode ? 0 : 4 }}
            transition={{ duration: 0.3, ease: easeSoft }}
          >
            {activeNode ? activeNode.full : ''}
          </motion.span>
        </div>
      </div>

      {/* Tappable service tiles */}
      {STACK_NODES.map((node, index) => {
        const isActive = active === node.id

        return (
          <div
            key={node.id}
            className="absolute z-50 flex flex-col items-center"
            style={{ left: `${node.slot.x}%`, top: `${node.slot.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              initial={still ? false : { opacity: 0, scale: 0.62 }}
              animate={{ opacity: active && !isActive ? 0.5 : 1, scale: 1 }}
              transition={{ duration: still ? 0.35 : 0.75, delay: still ? 0 : 0.2 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={nodeMotion(node, Boolean(active) && !isActive, isActive)}
              >
                <motion.button
                  type="button"
                  aria-label={`${node.full} — ${node.tagline.split(' • ').join(', ').toLowerCase()}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    setActive((current) => (current === node.id ? null : node.id))
                  }}
                  className={`grid ${STACK_CHIP.box} place-items-center border bg-[linear-gradient(150deg,rgba(255,255,255,0.97),rgba(255,255,255,0.62))] backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a380ed]/70 ${STACK_CHIP.shadow} ${
                    isActive ? 'border-[#a380ed]/70 text-[#4a2fa8] ring-2 ring-[#a380ed]/35' : 'border-white/85 text-[#5a3dbd]'
                  }`}
                  whileTap={still ? undefined : { scale: 0.94 }}
                >
                  <ServiceGlyph name={node.glyph} className={STACK_CHIP.icon} />
                </motion.button>

                <span
                  className={`mt-1.5 whitespace-nowrap font-[gilroy] font-semibold uppercase transition-colors duration-300 ${STACK_CHIP.label} ${
                    isActive ? 'text-[#4a2fa8]' : 'text-[#4b3a76]/70'
                  }`}
                >
                  {node.short}
                </span>
              </motion.div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

const IdeaEngine = (props) => {
  const desktop = useDesktopEngine()

  return desktop ? <DesktopInsightEngine {...props} /> : <MobileInsightEngine {...props} />
}

const Page1 = () => {
  const shouldReduceMotion = useReducedMotion()
  const heroRef = useRef(null)
  const engineRef = useRef(null)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const dotX = useMotionValue(0)
  const dotY = useMotionValue(0)

  const softX = useSpring(pointerX, { stiffness: 70, damping: 22, mass: 0.6 })
  const softY = useSpring(pointerY, { stiffness: 70, damping: 22, mass: 0.6 })
  const cursorX = useSpring(dotX, { stiffness: 90, damping: 26, mass: 0.5 })
  const cursorY = useSpring(dotY, { stiffness: 90, damping: 26, mass: 0.5 })

  const range = [-0.5, 0.5]
  const engineStyle = {
    x: useTransform(softX, range, [-16, 16]),
    y: useTransform(softY, range, [-12, 12]),
    rotateX: useTransform(softY, range, [9, -9]),
    rotateY: useTransform(softX, range, [-14, 14]),
  }
  const plateRotate = { rotateZ: useTransform(softX, range, [-2.5, 2.5]) }
  const orbRotate = { x: useTransform(softX, range, [-26, 26]), y: useTransform(softY, range, [-16, 16]) }
  /* One entry per service node. Depth grows outward so the ecosystem layers. */
  const nodeParallax = [
    { x: useTransform(softX, range, [-4, 4]), y: useTransform(softY, range, [-3, 3]) },
    { x: useTransform(softX, range, [-5, 5]), y: useTransform(softY, range, [-4, 4]) },
    { x: useTransform(softX, range, [-4, 4]), y: useTransform(softY, range, [-4, 4]) },
    { x: useTransform(softX, range, [-6, 6]), y: useTransform(softY, range, [-5, 5]) },
    { x: useTransform(softX, range, [-7, 7]), y: useTransform(softY, range, [-5, 5]) },
    { x: useTransform(softX, range, [-6, 6]), y: useTransform(softY, range, [-6, 6]) },
    { x: useTransform(softX, range, [-9, 9]), y: useTransform(softY, range, [-7, 7]) },
    { x: useTransform(softX, range, [-9, 9]), y: useTransform(softY, range, [-8, 8]) },
    { x: useTransform(softX, range, [-10, 10]), y: useTransform(softY, range, [-7, 7]) },
  ]
  const glowX = useTransform(softX, range, ['36%', '64%'])
  const glowY = useTransform(softY, range, ['32%', '62%'])

  const handlePointerMove = (event) => {
    if (shouldReduceMotion) return
    const hero = heroRef.current
    if (!hero) return
    const heroBox = hero.getBoundingClientRect()
    pointerX.set((event.clientX - heroBox.left) / heroBox.width - 0.5)
    pointerY.set((event.clientY - heroBox.top) / heroBox.height - 0.5)

    const engine = engineRef.current
    if (!engine) return
    const engineBox = engine.getBoundingClientRect()
    const inset = 22
    const x = Math.min(Math.max(event.clientX - engineBox.left, inset), engineBox.width - inset)
    const y = Math.min(Math.max(event.clientY - engineBox.top, inset), engineBox.height - inset)
    dotX.set(x - engineBox.width / 2)
    dotY.set(y - engineBox.height / 2)
  }

  const resetPointer = () => {
    pointerX.set(0)
    pointerY.set(0)
    dotX.set(0)
    dotY.set(0)
  }

  const plateLayers = [
    { depth: 0, shift: 22 },
    { depth: 26, shift: 0 },
    { depth: 52, shift: -22 },
  ]

  const rise = (delay) => (shouldReduceMotion ? {} : { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease: 'easeOut' } })
  const lineIn = (delay) => (shouldReduceMotion ? { initial: false } : { initial: { y: '108%' }, animate: { y: 0 }, transition: { duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] } })

  return (
    <section
      ref={heroRef}
      aria-labelledby="home-hero-title"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative isolate flex min-h-[clamp(40rem,92svh,54rem)] w-full flex-col justify-center overflow-hidden bg-[#f5f6fc] px-4 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16 lg:px-16 lg:pb-24 lg:pt-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(158deg,#f8f9fd_0%,#f4f1fb_36%,#eff2fd_64%,#eaf2fc_100%)]"
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[10%] -z-10 opacity-80"
        style={HERO_GRID}
        animate={shouldReduceMotion ? {} : { x: ['0%', '1.8%'], y: ['0%', '1.4%'], transition: { duration: 30, repeat: Infinity, ease: 'linear' } }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10"
        style={{
          x: glowX,
          y: glowY,
          width: '58%',
          height: '58%',
          left: '-10%',
          top: '-12%',
          background: 'radial-gradient(closest-side, rgba(90,61,189,0.20), rgba(90,61,189,0) 72%)',
          maskImage: 'radial-gradient(120% 95% at 50% 45%, #000 22%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(120% 95% at 50% 45%, #000 22%, transparent 76%)',
        }}
        animate={shouldReduceMotion ? {} : { opacity: [0.7, 1, 0.7], transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' } }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[9rem] bottom-[-11rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(79,139,255,0.20),transparent_64%)] blur-3xl"
        animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1], transition: { duration: 24, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[8rem] top-[-9rem] -z-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(163,128,237,0.22),transparent_66%)] blur-3xl"
        animate={shouldReduceMotion ? {} : { scale: [1, 1.12, 1], transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.045] mix-blend-multiply"
        style={{ backgroundImage: HERO_NOISE }}
      />

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-[14%] top-[24%] -z-10 h-2 w-2 rounded-full bg-[#67e8f9]/70"
        animate={shouldReduceMotion ? {} : { y: [0, -18, 0], opacity: [0.35, 0.8, 0.35], transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-[62%] top-[16%] -z-10 h-1.5 w-1.5 rounded-full bg-[#a380ed]/60"
        animate={shouldReduceMotion ? {} : { y: [0, 16, 0], opacity: [0.3, 0.75, 0.3], transition: { duration: 13, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-[48%] bottom-[18%] -z-10 h-2 w-2 rounded-full bg-[#4f8bff]/50"
        animate={shouldReduceMotion ? {} : { y: [0, -14, 0], opacity: [0.25, 0.7, 0.25], transition: { duration: 15, repeat: Infinity, ease: 'easeInOut' } }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,min(38.75rem,58%))_minmax(0,1fr)]">
          <div>
            <motion.div className="flex items-center gap-3" {...rise(0.05)}>
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#a380ed]" />
              <span className="font-[gilroy] text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:text-[11px]">
                We Insightians — Creative &amp; Digital
              </span>
            </motion.div>

            <h1
              id="home-hero-title"
              className="mt-6 font-[larken] uppercase leading-[0.95] tracking-[-0.02em] text-[#171126] text-[2.25rem] sm:mt-8 sm:text-6xl lg:text-[4rem] xl:text-[5rem]"
            >
              {[
                <span key="a">We turn ideas</span>,
                <span key="b">into digital</span>,
                <span key="c" className="text-[#5a3dbd]">experiences.</span>,
              ].map((line, index) => (
                <span key={index} className="block overflow-hidden pb-[0.05em]">
                  <motion.span className="block" {...lineIn(0.12 + index * 0.1)}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="mt-7 max-w-lg font-[gilroy] text-base leading-relaxed text-zinc-600 sm:mt-8 sm:text-lg"
              {...rise(0.45)}
            >
              We design and build digital experiences that help ambitious businesses look better, perform better and grow.
            </motion.p>

            <motion.div className="mt-9 flex items-center gap-4 sm:mt-10" {...rise(0.58)}>
              <Button to="/contact" arrow>
                Get Started
              </Button>

              <Button
                to="/contact"
                size="icon"
                aria-label="Get started"
                className="hover:rotate-45"
              >
                <img src="/right-arrow.png" alt="" className="h-full w-full" />
              </Button>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <IdeaEngine
                shouldReduceMotion={shouldReduceMotion}
                engineRef={engineRef}
                nodeParallax={nodeParallax}
                engineStyle={engineStyle}
                plateRotate={plateRotate}
                orbRotate={orbRotate}
                dotX={cursorX}
                dotY={cursorY}
                plateLayers={plateLayers}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Page1
