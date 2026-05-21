'use client'

import { useState } from 'react'
import { Plus, LayoutDashboard, DollarSign, Gem, Radio, Home, BookOpen, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { CaptureModal } from './CaptureModal'

const NAV_ITEMS = [
  { label: 'Command', href: '/command', Icon: LayoutDashboard },
  { label: 'Money', href: '/money', Icon: DollarSign },
  { label: 'Noire', href: '/noire', Icon: Gem },
  { label: 'Social', href: '/social', Icon: Radio },
  { label: 'Family', href: '/family', Icon: Home },
  { label: 'Legacy', href: '/legacy', Icon: BookOpen },
  { label: 'Alfred', href: '/alfred', Icon: Bot },
]

const CAPTURE_OPTIONS = [
  { label: 'Cash', type: 'cash' as const, emoji: '💰' },
  { label: 'Bill', type: 'bill' as const, emoji: '📄' },
  { label: 'Journal', type: 'journal' as const, emoji: '📝' },
  { label: 'Check-in', type: 'checkin' as const, emoji: '✅' },
  { label: 'Lead', type: 'lead' as const, emoji: '💎' },
  { label: 'Artifact', type: 'artifact' as const, emoji: '📎' },
]

export type CaptureType = 'cash' | 'bill' | 'journal' | 'checkin' | 'lead' | 'artifact'

export function FloatMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [captureType, setCaptureType] = useState<CaptureType | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  function handleNav(href: string) {
    setIsOpen(false)
    router.push(href)
  }

  function handleCapture(type: CaptureType) {
    setIsOpen(false)
    setCaptureType(type)
  }

  return (
    <>
      <CaptureModal type={captureType} onClose={() => setCaptureType(null)} />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(2,2,2,0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed left-4 right-4 z-50 rounded-2xl overflow-hidden"
              style={{
                bottom: '88px',
                background: 'rgba(10,10,10,0.99)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              }}
            >
              {/* Navigate */}
              <div className="p-4">
                <p style={{ color: '#333', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Navigate
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {NAV_ITEMS.map(({ label, href, Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    return (
                      <button
                        key={href}
                        onClick={() => handleNav(href)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                        style={{
                          background: active ? 'rgba(212,175,122,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${active ? 'rgba(212,175,122,0.2)' : 'rgba(255,255,255,0.04)'}`,
                        }}
                      >
                        <Icon size={17} strokeWidth={active ? 2 : 1.5} color={active ? '#d4af7a' : '#555'} />
                        <span style={{ fontSize: '7.5px', color: active ? '#d4af7a' : '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />

              {/* Capture */}
              <div className="p-4">
                <p style={{ color: '#333', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Capture
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {CAPTURE_OPTIONS.map(({ label, type, emoji }) => (
                    <button
                      key={type}
                      onClick={() => handleCapture(type)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>{emoji}</span>
                      <span style={{ fontSize: '8px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating + Button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed z-50"
        style={{
          bottom: '20px',
          right: '20px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: isOpen ? '#1a1a1a' : '#d4af7a',
          border: isOpen ? '1px solid rgba(255,255,255,0.1)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.6)' : '0 0 32px rgba(212,175,122,0.45)',
          cursor: 'pointer',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.18 }}>
          <Plus size={22} strokeWidth={2.5} color={isOpen ? '#666' : '#020202'} />
        </motion.div>
      </button>
    </>
  )
}
