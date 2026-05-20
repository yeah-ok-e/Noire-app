'use client'

import { useState, useRef } from 'react'
import { Search, X, Settings, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'

const COMMANDS: Array<{ pattern: RegExp; action: (match: RegExpMatchArray) => void; router: ReturnType<typeof useRouter> }> = []

function parseCommand(input: string, router: ReturnType<typeof useRouter>): string | null {
  const lower = input.toLowerCase().trim()

  if (/add \$?\d+/.test(lower)) {
    const amount = lower.match(/\$?(\d+)/)?.[1]
    router.push(`/money?add=cash&amount=${amount}`)
    return `Adding cash: $${amount}`
  }
  if (/rent/.test(lower) && /status|show|check/.test(lower)) {
    router.push('/money')
    return 'Navigating to Money — showing rent status'
  }
  if (/bill/.test(lower) && /add|new/.test(lower)) {
    router.push('/money?add=bill')
    return 'Opening add bill form'
  }
  if (/noire|lead/.test(lower) && /add|new/.test(lower)) {
    router.push('/noire?add=lead')
    return 'Opening add Noire lead form'
  }
  if (/check.?in|checkin/.test(lower)) {
    router.push('/body?add=checkin')
    return 'Opening daily check-in'
  }
  if (/money|finance|cash/.test(lower)) {
    router.push('/money')
    return 'Navigating to Money'
  }
  if (/income|job|employment/.test(lower)) {
    router.push('/income')
    return 'Navigating to Income'
  }
  if (/noire|brand/.test(lower)) {
    router.push('/noire')
    return 'Navigating to Noire HQ'
  }
  if (/artifact|document|file/.test(lower)) {
    router.push('/artifacts')
    return 'Navigating to Artifacts'
  }
  if (/family|home|house/.test(lower)) {
    router.push('/family')
    return 'Navigating to Family & Home'
  }
  if (/body|health|sleep/.test(lower)) {
    router.push('/body')
    return 'Navigating to Body'
  }
  if (/calendar|event|schedule/.test(lower)) {
    router.push('/calendar')
    return 'Navigating to Calendar'
  }
  if (/legacy|journal|memoir/.test(lower)) {
    router.push('/legacy')
    return 'Navigating to Legacy'
  }
  if (/admin|audit|log/.test(lower)) {
    router.push('/admin')
    return 'Navigating to Admin'
  }
  if (/command|dashboard|home/.test(lower)) {
    router.push('/command')
    return 'Navigating to Command Board'
  }
  if (/alfred|guardian/.test(lower)) {
    router.push('/alfred')
    return 'Opening Alfred Guardian'
  }
  if (/social|instagram|tiktok|youtube/.test(lower)) {
    router.push('/social')
    return 'Opening Social OS'
  }

  return null
}

interface CommandBarProps {
  isDemoMode?: boolean
}

export function CommandBar({ isDemoMode = false }: CommandBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
    setQuery('')
    setFeedback(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const result = parseCommand(query, router)
    if (result) {
      setFeedback(result)
      setTimeout(() => {
        handleCollapse()
      }, 800)
    } else {
      setFeedback('Command not recognized. Try: "show rent status" or "add $40"')
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border pt-safe">
      <div className="flex items-center justify-between px-4 h-12">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <ShieldCheck size={11} className="text-green-400/70" />
                </div>
                <span className="text-accent font-serif text-sm tracking-[0.2em] uppercase">Legacy OS</span>
              </div>
              <div className="flex items-center gap-1">
                {isDemoMode && (
                  <span className="text-[9px] uppercase tracking-widest border border-accent/40 text-accent/70 px-2 py-0.5 rounded mr-1">
                    Demo
                  </span>
                )}
                <Link href="/calendar" className="p-1.5 text-text-muted hover:text-text-primary transition-colors" title="Calendar">
                  <Calendar size={15} />
                </Link>
                <Link href="/admin" className="p-1.5 text-text-muted hover:text-text-primary transition-colors" title="Admin">
                  <Settings size={15} />
                </Link>
                <button onClick={handleExpand} className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                  <Search size={16} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex items-center gap-2 w-full"
            >
              <Search size={14} className="text-text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Command... &quot;add $40&quot;, &quot;show rent&quot;, &quot;noire leads&quot;"
                className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
              />
              {feedback ? (
                <span className="text-xs text-accent flex-shrink-0">{feedback}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
