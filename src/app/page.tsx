'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function CompassSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" stroke="rgba(240,237,232,0.15)" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="50" stroke="rgba(240,237,232,0.08)" strokeWidth="0.5" />
      {/* Cardinal tick marks */}
      <line x1="60" y1="4" x2="60" y2="14" stroke="rgba(240,237,232,0.5)" strokeWidth="1"/>
      <line x1="60" y1="106" x2="60" y2="116" stroke="rgba(240,237,232,0.3)" strokeWidth="0.8"/>
      <line x1="4" y1="60" x2="14" y2="60" stroke="rgba(240,237,232,0.3)" strokeWidth="0.8"/>
      <line x1="106" y1="60" x2="116" y2="60" stroke="rgba(240,237,232,0.3)" strokeWidth="0.8"/>
      {/* Diagonal ticks */}
      {[45,135,225,315].map(deg => (
        <line
          key={deg}
          x1={60 + 50 * Math.cos((deg - 90) * Math.PI / 180)}
          y1={60 + 50 * Math.sin((deg - 90) * Math.PI / 180)}
          x2={60 + 55 * Math.cos((deg - 90) * Math.PI / 180)}
          y2={60 + 55 * Math.sin((deg - 90) * Math.PI / 180)}
          stroke="rgba(240,237,232,0.2)"
          strokeWidth="0.6"
        />
      ))}
      {/* N label */}
      <text x="60" y="22" textAnchor="middle" fontSize="8" fill="rgba(240,237,232,0.9)" fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="2">N</text>
      {/* North needle (accent gold) */}
      <polygon
        points="60,28 55,65 60,60 65,65"
        fill="#d4af7a"
        fillOpacity="0.9"
      />
      {/* South needle */}
      <polygon
        points="60,92 55,55 60,60 65,55"
        fill="rgba(240,237,232,0.25)"
      />
      {/* Center dot */}
      <circle cx="60" cy="60" r="3" fill="#d4af7a" fillOpacity="0.8" />
      <circle cx="60" cy="60" r="1.5" fill="#080808" />
    </svg>
  )
}

export default function SplashPage() {
  const router = useRouter()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => setPhase(3), 2400)
    const t4 = setTimeout(() => router.replace('/command'), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [router])

  return (
    <div
      className="fixed inset-0 bg-[#080808] flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={() => router.replace('/command')}
    >
      {/* Ambient pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-[#d4af7a] opacity-[0.025] blur-3xl animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Compass */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="animate-pulse-glow"
            >
              <CompassSVG className="w-28 h-28" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEGACY OS */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <h1 className="text-4xl font-light tracking-[0.35em] text-[#f0ede8] uppercase">
                LEGACY OS
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand line */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 1 }}
              className="text-xs tracking-[0.3em] text-[#888888] uppercase mt-2"
            >
              A Lewis Family Product • MMXXVI
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
