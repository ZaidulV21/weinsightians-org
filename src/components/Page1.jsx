import React, { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import Button from './Button.jsx'

const HERO_GRID = {
  backgroundImage:
    'linear-gradient(to right, rgba(90, 61, 189, 0.075) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 139, 255, 0.075) 1px, transparent 1px)',
  backgroundSize: '58px 58px',
}

const HERO_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")"

const ENGINE_NODES = [
  { id: 'idea', label: 'Idea', glyph: 'spark', spot: 'left-[3%] top-[7%]', tilt: '-rotate-3', lift: 9, duration: 8.2, delay: 0.2 },
  { id: 'design', label: 'Design', glyph: 'crosshair', spot: 'right-[0%] top-[15%]', tilt: 'rotate-2', lift: 11, duration: 7.4, delay: 0.8 },
  { id: 'technology', label: 'Technology', glyph: 'chip', spot: 'right-[3%] bottom-[9%]', tilt: '-rotate-2', lift: 8, duration: 9.1, delay: 1.4 },
  { id: 'growth', label: 'Growth', glyph: 'trend', spot: 'left-[5%] bottom-[5%]', tilt: 'rotate-3', lift: 10, duration: 8.6, delay: 0.5 },
]

const NODE_TRAJECTORIES = [
  'M50 50 C 34 44, 24 34, 17 20',
  'M50 50 C 66 42, 76 32, 84 26',
  'M50 50 C 66 58, 76 70, 83 80',
  'M50 50 C 36 60, 28 70, 21 80',
]

const floatLoop = (lift, duration, delay) => ({
  y: [0, -lift, 0],
  transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
})

const HeroGlyph = ({ name, className = '' }) => {
  const shared = {
    className: `h-4 w-4 ${className}`,
    viewBox: '0 0 12 12',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.1,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }

  const shapes = {
    spark: (
      <>
        <path d="M6 1.4v2.1M6 8.5v2.1M1.4 6h2.1M8.5 6h2.1" />
        <path d="M2.9 2.9 4.4 4.4M7.6 7.6l1.5 1.5M9.1 2.9 7.6 4.4M4.4 7.6 2.9 9.1" />
      </>
    ),
    crosshair: (
      <>
        <circle cx="6" cy="6" r="3.5" />
        <path d="M6 1.4v1.9M6 8.7v1.9M1.4 6h1.9M8.7 6h1.9" />
      </>
    ),
    chip: (
      <>
        <rect x="3.1" y="3.1" width="5.8" height="5.8" rx="1.2" />
        <path d="M5 1.5v1.6M7 1.5v1.6M5 8.9v1.6M7 8.9v1.6M1.5 5h1.6M1.5 7h1.6M8.9 5h1.6M8.9 7h1.6" />
      </>
    ),
    trend: (
      <>
        <path d="M2.2 9.4 5.2 6.2l2.1 2.1L9.8 4" />
        <path d="M7.3 4h2.5v2.5" />
      </>
    ),
  }

  return <svg {...shared}>{shapes[name]}</svg>
}

const IdeaEngine = ({ shouldReduceMotion, engineRef, nodeParallax, engineStyle, orbRotate, plateRotate, dotX, dotY, plateLayers }) => {
  const still = shouldReduceMotion

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[20rem] sm:max-w-[24rem] lg:max-w-[30rem]">
      <div
        aria-hidden="true"
        className="absolute inset-x-[10%] bottom-[4%] h-14 rounded-[50%] bg-[radial-gradient(closest-side,rgba(35,23,70,0.22),transparent)] blur-lg"
      />

      <div className="absolute inset-0 grid place-items-center" style={{ perspective: '1150px' }}>
        <motion.div
          ref={engineRef}
          className="relative h-60 w-60 sm:h-72 sm:w-72"
          animate={still ? {} : floatLoop(9, 8.4, 0)}
        >
          <motion.div className="relative h-full w-full" style={engineStyle}>
          <motion.div
            aria-hidden="true"
            className="absolute -inset-12 rounded-full opacity-70"
            style={{
              background: 'conic-gradient(from 0deg, rgba(163,128,237,0.55), rgba(79,139,255,0.35), rgba(103,232,249,0.5), rgba(163,128,237,0.55))',
              maskImage: 'radial-gradient(closest-side, transparent 62%, #000 66%)',
              WebkitMaskImage: 'radial-gradient(closest-side, transparent 62%, #000 66%)',
            }}
            animate={still ? {} : { rotate: 360, transition: { duration: 40, repeat: Infinity, ease: 'linear' } }}
          />

          <motion.div aria-hidden="true" className="absolute inset-x-0 top-[64%] h-0" style={plateRotate}>
            {plateLayers.map((layer) => (
              <div
                key={layer.depth}
                className="absolute left-1/2 top-1/2 h-40 w-40 rounded-[1.6rem] border border-white/80 bg-white/45 shadow-[0_24px_50px_-24px_rgba(35,23,70,0.5)] backdrop-blur-[3px] sm:h-48 sm:w-48"
                style={{ transform: `translate(-50%, -50%) rotateX(56deg) rotateZ(-32deg) translateY(${layer.shift}px) translateZ(${layer.depth}px)` }}
              />
            ))}
          </motion.div>

          <motion.div className="absolute inset-x-0 top-[2%]" style={orbRotate}>
            <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24">
              <span aria-hidden="true" className="absolute -inset-5 rounded-full bg-[#a380ed]/25 blur-xl" />
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 34% 28%, #ffffff 0%, #e4d8fb 26%, #a380ed 56%, #6d4fd6 78%, #4f8bff 100%)',
                  boxShadow: 'inset 0 0 18px rgba(255,255,255,0.65), 0 18px 34px -14px rgba(35,23,70,0.55)',
                }}
              />
              <span aria-hidden="true" className="absolute left-[26%] top-[20%] h-3 w-3 rounded-full bg-white/80 blur-[1px]" />
              <motion.span
                aria-hidden="true"
                className="absolute -inset-3 rounded-full border border-dashed border-[#5a3dbd]/35"
                animate={still ? {} : { rotate: -360, transition: { duration: 26, repeat: Infinity, ease: 'linear' } }}
              />
            </div>
          </motion.div>

          <motion.span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-[#67e8f9] shadow-[0_0_14px_4px_rgba(103,232,249,0.55)]"
            style={{ x: dotX, y: dotY }}
          />
          </motion.div>
        </motion.div>
      </div>

      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
        {ENGINE_NODES.map((node, index) => (
          <motion.path
            key={node.id}
            d={NODE_TRAJECTORIES[index]}
            stroke="rgba(90, 61, 189, 0.3)"
            strokeWidth="0.4"
            strokeDasharray="1.6 2.6"
            strokeLinecap="round"
            animate={still ? {} : { strokeDashoffset: [0, -42], transition: { duration: 14 + index * 3, repeat: Infinity, ease: 'linear' } }}
          />
        ))}
      </svg>

      {ENGINE_NODES.map((node, index) => (
        <motion.div
          key={node.id}
          className={`absolute ${node.spot} flex flex-col items-center gap-2`}
          animate={still ? {} : floatLoop(node.lift, node.duration, node.delay)}
        >
          <motion.div className="flex flex-col items-center gap-2" style={nodeParallax[index]}>
            <span
              className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/85 bg-white/80 text-[#5a3dbd] shadow-[0_16px_38px_-18px_rgba(35,23,70,0.5)] backdrop-blur-md ${node.tilt}`}
            >
              <HeroGlyph name={node.glyph} />
            </span>
            <span className="font-[gilroy] text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{node.label}</span>
          </motion.div>
        </motion.div>
      ))}

      <motion.div
        aria-hidden="true"
        className="absolute right-[16%] top-[38%] hidden rounded-lg border border-white/80 bg-white/75 px-2 py-1.5 shadow-[0_12px_30px_-16px_rgba(35,23,70,0.45)] backdrop-blur-md sm:block"
        animate={still ? {} : floatLoop(11, 9.2, 0.4)}
      >
        <motion.div className="flex items-center gap-1" style={nodeParallax[1]}>
          <i className="h-1.5 w-1.5 rounded-full bg-[#a380ed]" />
          <i className="h-1.5 w-1.5 rounded-full bg-[#4f8bff]" />
          <i className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[20%] left-[9%] hidden h-12 w-16 items-end gap-1.5 rounded-xl border border-white/80 bg-white/75 px-2.5 py-2 shadow-[0_12px_30px_-16px_rgba(35,23,70,0.45)] backdrop-blur-md sm:flex"
        animate={still ? {} : floatLoop(9, 10.4, 1.5)}
      >
        <motion.div className="flex h-full w-full items-end gap-1.5" style={nodeParallax[3]}>
          <i className="h-2.5 w-1.5 rounded-sm bg-[#a380ed]/70" />
          <i className="h-5 w-1.5 rounded-sm bg-[#4f8bff]/70" />
          <i className="h-3.5 w-1.5 rounded-sm bg-[#67e8f9]/80" />
        </motion.div>
      </motion.div>
    </div>
  )
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
  const nodeParallax = [
    { x: useTransform(softX, range, [-6, 6]), y: useTransform(softY, range, [-5, 5]) },
    { x: useTransform(softX, range, [-9, 9]), y: useTransform(softY, range, [-7, 7]) },
    { x: useTransform(softX, range, [-12, 12]), y: useTransform(softY, range, [-9, 9]) },
    { x: useTransform(softX, range, [-15, 15]), y: useTransform(softY, range, [-11, 11]) },
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
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
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

          <div className="lg:col-span-5 lg:-ml-10 xl:-ml-16">
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
