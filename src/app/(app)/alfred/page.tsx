'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Activity, Zap, Eye, Brain, Heart, User, Send, ChevronUp, X } from 'lucide-react'

// ─── Agent Data ────────────────────────────────────────────────────────────────

const AGENTS = [
  {
    code: 'OPS',
    title: 'Operations',
    color: '#d4af7a',
    icon: Zap,
    status: 'ACTIVE',
    lastAction: 'Flagged overdue ConEd bill',
    domain: 'Finances, Opportunities, Operations',
    authority: 'Execute financial moves, manage bills, flag cash flow risks',
    lastActions: [
      'Flagged overdue ConEd bill',
      'Updated rent countdown',
      'Surfaced LIHEAP opportunity',
    ],
    nextTask: 'Review Q2 cash flow projection and flag upcoming deadlines',
  },
  {
    code: 'SENTINEL',
    title: 'Security',
    color: '#3b82f6',
    icon: Shield,
    status: 'MONITORING',
    lastAction: 'E2E encryption verified',
    domain: 'Security, Privacy, Digital Footprint',
    authority: 'Monitor system integrity, scan for exposures, camouflage digital presence',
    lastActions: [
      'Completed footprint scan — 3 exposures found',
      'E2E encryption verified',
      'Suspicious login attempt blocked',
    ],
    nextTask: 'Deliver weekly privacy report and resolve flagged exposures',
  },
  {
    code: 'ORACLE',
    title: 'Intelligence',
    color: '#22c55e',
    icon: Eye,
    status: 'SCANNING',
    lastAction: 'Scanned founder network proximity',
    domain: 'Intel, Trends, Competitor Analysis',
    authority: 'Research opportunities, surface market intelligence, analyze moves',
    lastActions: [
      'Identified 2 new Noire leads',
      'Scanned founder network proximity',
      'Updated opportunity intel',
    ],
    nextTask: 'Surface emerging streetwear market gaps for Noire positioning',
  },
  {
    code: 'COUNSEL',
    title: 'Legal & Guidance',
    color: '#a855f7',
    icon: Brain,
    status: 'STANDBY',
    lastAction: 'Flagged lease renewal deadline',
    domain: 'Legal, Contracts, Compliance',
    authority: 'Review agreements, flag legal risks, draft response templates',
    lastActions: [
      'Reviewed eviction notice response',
      'Flagged lease renewal deadline',
      'Prepared ERAP documentation',
    ],
    nextTask: 'Finalize LLC formation checklist before Noire revenue threshold',
  },
  {
    code: 'MEDIC',
    title: 'Health',
    color: '#f97316',
    icon: Heart,
    status: 'STANDBY',
    lastAction: 'Daily check-in logged',
    domain: 'Health, Wellness, Body Metrics',
    authority: 'Track check-ins, flag health patterns, surface resources',
    lastActions: [
      'Daily check-in logged',
      'Sleep pattern flagged',
      'Hydration reminder queued',
    ],
    nextTask: 'Generate weekly wellness summary and flag any critical patterns',
  },
  {
    code: 'ALFRED',
    title: 'Guardian',
    color: '#f0ede8',
    icon: User,
    status: 'ONLINE',
    lastAction: 'All agents nominal',
    domain: 'System Orchestration, Family Safety, Final Authority',
    authority: 'Coordinate all agents, execute approved directives, report to Eligah only',
    lastActions: [
      'Morning briefing delivered',
      'All agents nominal',
      'Noire pipeline review queued',
    ],
    nextTask: 'Deliver end-of-day system digest and queue overnight agent tasks',
  },
]

// ─── System Integrity Data ─────────────────────────────────────────────────────

const INTEGRITY_STATS = [
  {
    label: 'Encryption',
    value: 'AES-256',
    detail: 'All data at rest and in transit is protected with AES-256 encryption — the same standard used by financial institutions and governments. Your directives, records, and agent outputs are never readable by any third party.',
  },
  {
    label: 'Uptime',
    value: '99.97%',
    detail: 'Alfred and all board agents maintain 99.97% operational uptime, with redundant failover protocols. No directive goes unprocessed. No alert goes undelivered.',
  },
  {
    label: 'Threat Level',
    value: 'LOW',
    detail: 'SENTINEL has completed its latest scan. Current threat level is LOW. No active intrusion attempts. 3 passive exposures are queued for remediation — non-critical, scheduled for this week.',
  },
]

// ─── Command Log ───────────────────────────────────────────────────────────────

const COMMAND_LOG = [
  { time: '07:12', agent: 'ALFRED', action: 'Morning system briefing delivered to Eligah' },
  { time: '07:15', agent: 'OPS', action: 'Flagged overdue ConEd bill — action required' },
  { time: '08:03', agent: 'SENTINEL', action: 'Nightly footprint scan completed — 3 items flagged' },
  { time: '09:30', agent: 'ORACLE', action: '2 new Noire leads identified — added to pipeline' },
  { time: '11:45', agent: 'COUNSEL', action: 'Lease renewal deadline flagged — 22 days remaining' },
]

// ─── Alfred Responses ─────────────────────────────────────────────────────────

const ALFRED_RESPONSES = [
  'Directive received. Routing to OPS for processing. Estimated resolution: 4 hours. I\'ll report back.',
  'Acknowledged. SENTINEL has flagged this as a priority. No external action taken without your approval.',
  'Understood. COUNSEL has been briefed. Response framework drafted — review in Legacy when ready.',
  'Noted. This aligns with the Noire growth vector. ORACLE is cross-referencing now.',
  'Received and logged. Your system is clean. No threats detected. Proceed with confidence.',
]

// ─── Agent color for log ───────────────────────────────────────────────────────

function agentColor(code: string): string {
  const found = AGENTS.find(a => a.code === code)
  return found ? found.color : '#888'
}

// ─── Status badge styles ───────────────────────────────────────────────────────

function statusStyle(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'text-[#d4af7a] border-[#d4af7a]/30 bg-[#d4af7a]/10'
    case 'MONITORING': return 'text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/10'
    case 'SCANNING': return 'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10'
    case 'STANDBY': return 'text-[#555] border-[#2a2a2a] bg-[#111]'
    case 'ONLINE': return 'text-[#f0ede8] border-[#f0ede8]/20 bg-[#f0ede8]/5'
    default: return 'text-[#555] border-[#2a2a2a]'
  }
}

// ─── Bottom Sheet ──────────────────────────────────────────────────────────────

type SheetData =
  | { type: 'agent'; data: typeof AGENTS[0] }
  | { type: 'integrity'; data: typeof INTEGRITY_STATS[0] }

function BottomSheet({ sheet, onClose }: { sheet: SheetData | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {sheet && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/70"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-x border-[#1c1c1c] overflow-hidden"
            style={{ background: '#080808', maxHeight: '80vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-0.5 rounded-full bg-[#2a2a2a]" />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 40px)' }}>
              <div className="px-5 pb-10 space-y-5">
                {/* Close button */}
                <div className="flex justify-between items-center pt-1">
                  {sheet.type === 'agent' ? (
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl font-light tracking-widest"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: sheet.data.color }}
                      >
                        {sheet.data.code}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[#3a3a3a]">{sheet.data.title}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#3a3a3a]">System Integrity</p>
                      <p className="text-lg font-light text-[#d4af7a] mt-0.5">{sheet.data.label}</p>
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1c1c1c] text-[#3a3a3a] hover:text-[#888] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {sheet.type === 'agent' ? (
                  <>
                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded border ${statusStyle(sheet.data.status)}`}>
                        {sheet.data.status}
                      </span>
                    </div>

                    {/* Domain */}
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-1.5">Domain</p>
                      <p className="text-xs text-[#888]">{sheet.data.domain}</p>
                    </div>

                    {/* Authority */}
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-1.5">Authority</p>
                      <p className="text-xs text-[#888] leading-relaxed border-l border-[#d4af7a]/30 pl-3">
                        {sheet.data.authority}
                      </p>
                    </div>

                    {/* Last 3 actions */}
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-2">Last Actions</p>
                      <div className="space-y-2">
                        {sheet.data.lastActions.map((action, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#888]">
                            <span style={{ color: sheet.data.color }} className="mt-0.5 flex-shrink-0 text-[10px]">◆</span>
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next task */}
                    <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4">
                      <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-1.5">Next Task</p>
                      <p className="text-xs text-[#888]">{sheet.data.nextTask}</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4">
                    <p className="text-sm font-light text-[#f0ede8] mb-3"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      {sheet.data.value}
                    </p>
                    <p className="text-xs text-[#888] leading-relaxed">{sheet.data.detail}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AlfredPage() {
  const [entranceDone, setEntranceDone] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [sheet, setSheet] = useState<SheetData | null>(null)
  const [directive, setDirective] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [responding, setResponding] = useState(false)
  const responseIndexRef = useRef(0)

  useEffect(() => {
    const seen = sessionStorage.getItem('alfred-intro-seen')
    if (seen) {
      setEntranceDone(true)
      setContentReady(true)
      return
    }
    sessionStorage.setItem('alfred-intro-seen', '1')
    const t1 = setTimeout(() => setEntranceDone(true), 3200)
    const t2 = setTimeout(() => setContentReady(true), 3600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  function handleDirective() {
    if (!directive.trim() || responding) return
    setResponding(true)
    setResponse(null)
    const idx = responseIndexRef.current % ALFRED_RESPONSES.length
    responseIndexRef.current += 1
    setTimeout(() => {
      setResponse(ALFRED_RESPONSES[idx])
      setResponding(false)
      setDirective('')
    }, 800)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleDirective()
    }
  }

  return (
    <div className="relative min-h-screen" style={{ background: '#020202' }}>

      {/* ── Entrance Animation ── */}
      <AnimatePresence>
        {!entranceDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.015 }}
            transition={{ duration: 1.4, ease: [0.7, 0, 0.84, 0] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: '#020202' }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(ellipse, #d4af7a, transparent)', filter: 'blur(50px)' }}
            />

            {/* ALFRED — letter stagger */}
            <div className="flex items-end" style={{ gap: '0.16em' }}>
              {'ALFRED'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, delay: 0.12 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[52px] font-light select-none"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    color: '#d4af7a',
                    lineHeight: 1,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Gold hairline */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '72px', opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 h-px"
              style={{ background: '#d4af7a' }}
            />

            {/* Sub-label */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.35, y: 0 }}
              transition={{ duration: 1.2, delay: 1.5, ease: 'easeOut' }}
              className="mt-4 text-[9px] uppercase tracking-[0.55em] text-[#888]"
            >
              GUARDIAN PROTOCOL
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="px-4 py-6 space-y-8 pb-16"
      >

        {/* ── Header ── */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.55em] text-[#d4af7a]/50 mb-3">Legacy OS</p>
          <div className="flex items-end justify-between">
            <div>
              <h1
                className="text-4xl font-light tracking-[0.3em] uppercase"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: '#d4af7a',
                  fontVariant: 'small-caps',
                }}
              >
                ALFRED
              </h1>
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#3a3a3a] mt-1.5">Guardian Protocol</p>
            </div>

            {/* Online status */}
            <div className="flex items-center gap-2 bg-[#080808] border border-[#1c1c1c] rounded-full px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-[9px] uppercase tracking-widest text-green-400">Online</span>
            </div>
          </div>
        </div>

        {/* ── System Integrity ── */}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#2a2a2a] mb-3">System Integrity</p>
          <div className="grid grid-cols-3 gap-2">
            {INTEGRITY_STATS.map((stat) => (
              <button
                key={stat.label}
                onClick={() => setSheet({ type: 'integrity', data: stat })}
                className="bg-[#080808] border border-[#1c1c1c] rounded-xl p-3 text-left active:scale-95 transition-transform"
              >
                <p className="text-[8px] uppercase tracking-widest text-[#3a3a3a] mb-1.5">{stat.label}</p>
                <p
                  className="text-xs font-light text-[#d4af7a]"
                  style={{ fontFamily: 'ui-monospace, "Courier New", monospace' }}
                >
                  {stat.value}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Active Agents Board ── */}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#2a2a2a] mb-3">Active Agents</p>
          <div className="grid grid-cols-2 gap-2">
            {AGENTS.map((agent) => {
              const Icon = agent.icon
              return (
                <motion.button
                  key={agent.code}
                  onClick={() => setSheet({ type: 'agent', data: agent })}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#080808] border border-[#1c1c1c] rounded-xl p-4 text-left transition-colors hover:border-[#2a2a2a] relative overflow-hidden"
                >
                  {/* Top row: color dot + code */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: agent.color }}
                    />
                    <span
                      className="text-sm font-light tracking-widest"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        color: agent.color,
                      }}
                    >
                      {agent.code}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-2">{agent.title}</p>

                  {/* Status badge */}
                  <span
                    className={`inline-block text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${statusStyle(agent.status)}`}
                  >
                    {agent.status}
                  </span>

                  {/* Last action */}
                  <p
                    className="text-[9px] text-[#444] mt-2 leading-relaxed line-clamp-2"
                    style={{ fontFamily: 'ui-monospace, "Courier New", monospace' }}
                  >
                    {agent.lastAction}
                  </p>

                  {/* Corner icon */}
                  <Icon
                    size={24}
                    className="absolute bottom-3 right-3 opacity-[0.04]"
                    style={{ color: agent.color }}
                  />
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Command Log ── */}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#2a2a2a] mb-3">Command Log</p>
          <div
            className="bg-[#080808] border border-[#1c1c1c] rounded-xl overflow-hidden"
          >
            {COMMAND_LOG.map((entry, i) => (
              <div
                key={i}
                className={`px-4 py-3 flex items-start gap-3 ${i < COMMAND_LOG.length - 1 ? 'border-b border-[#101010]' : ''}`}
              >
                <span
                  className="text-[9px] text-[#2a2a2a] flex-shrink-0 mt-0.5"
                  style={{ fontFamily: 'ui-monospace, "Courier New", monospace' }}
                >
                  {entry.time}
                </span>
                <span
                  className="text-[9px] font-light flex-shrink-0 mt-0.5 uppercase tracking-wider"
                  style={{ color: agentColor(entry.agent), fontFamily: 'ui-monospace, "Courier New", monospace' }}
                >
                  {entry.agent}
                </span>
                <p
                  className="text-[10px] text-[#555] leading-relaxed"
                  style={{ fontFamily: 'ui-monospace, "Courier New", monospace' }}
                >
                  {entry.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Directive Input ── */}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#2a2a2a] mb-3">Send Directive</p>
          <div className="bg-[#080808] border border-[#1c1c1c] rounded-xl overflow-hidden">
            <textarea
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send Directive to Alfred..."
              rows={3}
              className="w-full bg-transparent px-4 pt-4 pb-2 text-xs text-[#888] placeholder-[#2a2a2a] resize-none outline-none leading-relaxed"
              style={{ fontFamily: 'ui-monospace, "Courier New", monospace' }}
            />
            <div className="px-4 pb-3 flex items-center justify-between">
              <p className="text-[8px] text-[#2a2a2a] uppercase tracking-widest">⌘ + Return to send</p>
              <button
                onClick={handleDirective}
                disabled={!directive.trim() || responding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all disabled:opacity-30"
                style={{
                  borderColor: directive.trim() && !responding ? '#d4af7a' : '#1c1c1c',
                  color: directive.trim() && !responding ? '#d4af7a' : '#3a3a3a',
                  background: directive.trim() && !responding ? 'rgba(212,175,122,0.08)' : 'transparent',
                }}
              >
                <Send size={10} />
                <span className="text-[9px] uppercase tracking-widest">
                  {responding ? 'Processing…' : 'Send'}
                </span>
              </button>
            </div>
          </div>

          {/* Alfred Response */}
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 bg-[#080808] border border-[#d4af7a]/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1 h-1 rounded-full bg-[#d4af7a]"
                  />
                  <span className="text-[9px] uppercase tracking-widest text-[#d4af7a]/60">Alfred</span>
                </div>
                <p
                  className="text-xs text-[#888] leading-relaxed"
                  style={{ fontFamily: 'ui-monospace, "Courier New", monospace' }}
                >
                  {response}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Privacy Note ── */}
        <div className="flex items-start gap-2.5 py-2">
          <Shield size={10} className="text-[#2a2a2a] flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#2a2a2a] leading-relaxed uppercase tracking-wider">
            All directives encrypted in transit. Zero external logging.
          </p>
        </div>

      </motion.div>

      {/* ── Bottom Sheet ── */}
      <BottomSheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}
