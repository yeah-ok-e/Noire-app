'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatCurrency } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'

function starPoints(cx: number, cy: number, R: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const rad = i % 2 === 0 ? R : r
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

function NoireLogoBadge({ size = 120, className }: { size?: number; className?: string }) {
  const fg = '#ffffff'
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <path id="noire-arc-top" d="M 22,100 A 78,78 0 0,1 178,100" />
      </defs>
      {/* Outer ring */}
      <circle cx="100" cy="100" r="93" stroke={fg} strokeWidth="7" fill="none" />
      {/* Inner ring */}
      <circle cx="100" cy="100" r="79" stroke={fg} strokeWidth="1.5" fill="none" />
      {/* Bottom filled banner */}
      <path d="M 41,141 A 68,68 0 0,0 159,141 L 158,151 A 76,76 0 0,1 42,151 Z" fill={fg} />
      {/* NOIRE curved text */}
      <text fill={fg} fontSize="20" fontWeight="900" letterSpacing="5" fontFamily="'Arial Black', Arial, sans-serif">
        <textPath href="#noire-arc-top" startOffset="50%" textAnchor="middle">NOIRE</textPath>
      </text>
      {/* MMXVII — left, rotated */}
      <text fill={fg} fontSize="8" fontWeight="700" letterSpacing="2" fontFamily="Arial, sans-serif"
        textAnchor="middle" transform="translate(32,100) rotate(-90)">MMXVII</text>
      {/* MMXXVI — right, rotated */}
      <text fill={fg} fontSize="8" fontWeight="700" letterSpacing="2" fontFamily="Arial, sans-serif"
        textAnchor="middle" transform="translate(168,100) rotate(90)">MMXXVI</text>
      {/* Compass rose — N point */}
      <polygon points="100,51 103.5,93 100,100 96.5,93" fill={fg} />
      {/* S point */}
      <polygon points="100,149 103.5,107 100,100 96.5,107" fill={fg} />
      {/* E point */}
      <polygon points="149,100 107,103.5 100,100 107,96.5" fill={fg} />
      {/* W point */}
      <polygon points="51,100 93,103.5 100,100 93,96.5" fill={fg} />
      {/* NE diagonal */}
      <polygon points="129,71 104,97 100,100 103,96" fill={fg} />
      {/* NW diagonal */}
      <polygon points="71,71 96,97 100,100 97,96" fill={fg} />
      {/* SE diagonal */}
      <polygon points="129,129 104,103 100,100 103,104" fill={fg} />
      {/* SW diagonal */}
      <polygon points="71,129 96,103 100,100 97,104" fill={fg} />
      {/* Four quadrant stars */}
      <polygon points={starPoints(67, 67, 6, 2.5)} fill={fg} />
      <polygon points={starPoints(133, 67, 6, 2.5)} fill={fg} />
      <polygon points={starPoints(67, 129, 6, 2.5)} fill={fg} />
      <polygon points={starPoints(133, 129, 6, 2.5)} fill={fg} />
      {/* Banner stars (5 — dark on light banner) */}
      <polygon points={starPoints(70, 145, 4, 1.8)} fill="black" />
      <polygon points={starPoints(84, 145, 4, 1.8)} fill="black" />
      <polygon points={starPoints(100, 145, 4, 1.8)} fill="black" />
      <polygon points={starPoints(116, 145, 4, 1.8)} fill="black" />
      <polygon points={starPoints(130, 145, 4, 1.8)} fill="black" />
    </svg>
  )
}

const SEASONS = [
  {
    id: 's1', name: 'PRESSURE ERA', period: 'Jan – Jun 2026', status: 'current',
    theme: 'Building in silence. Everything counts.',
    goal: '$10k revenue milestone',
    drops: [
      { name: 'Limited Hoodie — Origin Series', date: 'May 30, 2026', status: 'live' },
      { name: 'Graphic Tee Drop 001', date: 'Jun 15, 2026', status: 'planning' },
    ],
    content: ['Building in Silence documentary', 'Origin Story essay', 'Behind the sample BTS'],
  },
  {
    id: 's2', name: 'EMERGENCE', period: 'Jul – Dec 2026', status: 'planning',
    theme: 'The world starts to see.',
    goal: '$50k revenue — first store placement',
    drops: [
      { name: 'Full Fall Collection', date: 'Aug 2026', status: 'concept' },
      { name: 'Pop-up Event [City]', date: 'Oct 2026', status: 'concept' },
      { name: 'Holiday Edit — Limited', date: 'Dec 2026', status: 'concept' },
    ],
    content: ['Emergence film', 'Brand manifesto print', 'Pop-up performance art'],
  },
  {
    id: 's3', name: 'ABOVE ALL', period: 'Jan – Jun 2027', status: 'vision',
    theme: 'Cortiez-level hysteria. History in real time.',
    goal: 'First flagship. International placement.',
    drops: [],
    content: [],
  },
]

const AGENTS = [
  {
    code: 'CEO', color: '#d4af7a', status: 'Brand vision aligned — 2 decisions pending review', dept: 'Executive', pulse: true,
    approvals: ['Approve direction for Pressure Era campaign messaging', 'Review long-term brand equity positioning'],
    needToKnow: ['Origin Series needs a drop date confirmed by May 15', 'Legal structure for Noire LLC should be finalized before revenue crosses $10k', 'First hire: creative director is the highest-leverage move when ready'],
  },
  {
    code: 'CMO', color: '#a78bfa', status: 'Drop announcement sequence drafted — ready to deploy', dept: 'Marketing', pulse: true,
    approvals: ['Approve announcement copy for Origin Series hoodie', 'Review 3-post Instagram sequence before deploy'],
    needToKnow: ['The story is the marketing. Every post should add to the mythology, not just announce product', 'Timing: Tuesday and Thursday posts perform 40% above average for luxury streetwear', '@noireuniform needs 2–3 posts/week minimum to maintain algorithm momentum'],
  },
  {
    code: 'CRO', color: '#facc15', status: '3 hot leads in pipeline — follow-up due Thursday', dept: 'Revenue', pulse: true,
    approvals: ['Approve lead outreach template for 3 hot contacts', 'Review pricing strategy for bulk/wholesale inquiries'],
    needToKnow: ['All 3 hot leads require personal follow-up, not automated messages — they respond to authenticity', 'Current conversion rate: 34%. Industry benchmark is 20%. You\'re above it.', 'Bundle pricing ($195 hoodie + $65 tee = $240 bundle) could increase AOV significantly'],
  },
  {
    code: 'CCO', color: '#f472b6', status: 'Origin Series mockups in progress — est. 5 days', dept: 'Creative', pulse: false,
    approvals: ['Review Origin Series mockup round 1 when complete', 'Approve brand color usage for Fall collection direction'],
    needToKnow: ['The creative direction should always answer: "What does this say about who we are 10 years from now?"', 'Current color palette is strong. Don\'t dilute it with seasonal color trends.', 'Lookbook concept for Emergence should incorporate the city — this is a movement, not just a brand'],
  },
  {
    code: 'CFO', color: '#4ade80', status: 'Margin analysis complete — recommend $285 price point', dept: 'Finance', pulse: false,
    approvals: ['Review pricing recommendation ($285 vs $215 current)', 'Approve reinvestment allocation for next production run'],
    needToKnow: ['At $285, margin is 67%. At $215, margin is 54%. The price increase is fully justified by brand positioning.', 'First production run should be 9–12 units. Scarcity is the mechanism.', 'Reinvest 60% of every sale back into production until you hit 3 drops/year cadence'],
  },
  {
    code: 'COO', color: '#f0ede8', status: 'Fulfillment workflow mapped — awaiting first bulk order', dept: 'Operations', pulse: false,
    approvals: ['Approve supplier contract terms for next production run', 'Review fulfillment timeline for Origin Series'],
    needToKnow: ['Lead time from current supplier: 18–21 days. Plan drops accordingly.', 'Photography and product content should be created in the same session as sampling — efficiency.', 'Packaging is part of the experience. The unboxing should feel like opening something rare.'],
  },
  {
    code: 'CBO', color: '#d4af7a', status: 'Identity guide v2 — 80% complete', dept: 'Brand', pulse: false,
    approvals: ['Review identity guide v2 when complete', 'Approve brand voice document for team use'],
    needToKnow: ['Brand voice: composed, assured, deliberate. Never desperate. Never discounting.', 'Every brand touchpoint — from DMs to packaging — should feel like the brand you want to be at $50M revenue.', 'The visual identity is strong. Guard it. Deviation is dilution.'],
  },
  {
    code: 'CTO', color: '#60a5fa', status: 'Shopify store optimization queued', dept: 'Technology', pulse: false,
    approvals: ['Approve Shopify theme update direction', 'Review checkout flow optimization plan'],
    needToKnow: ['Current store conversion rate needs mobile optimization — 70%+ of traffic is mobile', 'Email capture at checkout should be prioritized — the list is the long-term asset', 'Product page copy needs to reflect the brand voice. Feature descriptions are not enough.'],
  },
]

const CONTENT_PIPELINE = [
  { title: 'Brand Manifesto Quote Card', lane: 'short-form', status: 'ready', format: 'Visual' },
  { title: 'BTS Footage — Sample Fitting', lane: 'short-form', status: 'ready', format: 'Video' },
  { title: '"Why I Build" Essay', lane: 'long-form', status: 'review', format: 'Written' },
  { title: 'Origin Story Documentary', lane: 'film', status: 'production', format: 'Film' },
  { title: 'Season Lookbook', lane: 'visual', status: 'production', format: 'Photo' },
  { title: 'Brand Story Video Script', lane: 'short-form', status: 'draft', format: 'Video' },
  { title: 'Cover Art — Pressure Era', lane: 'visual', status: 'ready', format: 'Visual' },
  { title: 'Box & Packaging Design', lane: 'visual', status: 'review', format: 'Design' },
  { title: 'Noire Canvas Print — Limited', lane: 'visual', status: 'draft', format: 'Art' },
]

const STATUS_COLORS: Record<string, string> = {
  ready: 'text-green-400 border-green-400/30 bg-green-400/10',
  review: 'text-accent border-accent/30 bg-accent/10',
  production: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  draft: 'text-text-muted border-border bg-surface-2',
}

const VISION_LINES = [
  "The culture doesn't need another label. It needs a covenant. Noire is that covenant.",
  "Every piece ships carrying the weight of what we overcame to make it. That energy can't be manufactured.",
  "One day someone will recognize a stranger wearing Noire and feel exactly what we felt building it.",
  "We don't chase trend cycles. We set reference points. Future designers will trace their lineage back here.",
  "The brand is the autobiography written in fabric. Every drop a chapter no one else has the right to tell.",
]

const leadFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Customer name', required: true },
  { name: 'contact', label: 'Contact / Handle', type: 'text', placeholder: '@handle or email' },
  { name: 'platform', label: 'Platform', type: 'text', placeholder: 'Instagram, Email, etc.' },
  { name: 'interest', label: 'Interest', type: 'text', placeholder: 'What they want' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'new', label: 'New' }, { value: 'warm', label: 'Warm' },
    { value: 'hot', label: 'Hot' }, { value: 'closed', label: 'Closed' },
  ], defaultValue: 'new' },
  { name: 'estimated_value', label: 'Estimated Value ($)', type: 'number', placeholder: '0' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Context...' },
]

export default function NoirePage() {
  const { demoData } = useDemoMode()
  const [entranceDone, setEntranceDone] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [addModal, setAddModal] = useState<'lead' | null>(null)
  const [leads, setLeads] = useState(demoData.noireLeads)
  const [selectedSeason, setSelectedSeason] = useState(SEASONS[0])
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null)
  const inventory = demoData.noireInventory

  const totalInventoryValue = inventory.reduce((s, i) => s + ((i.price || 0) * i.quantity), 0)
  const hotLeads = leads.filter(l => l.status === 'hot').length
  const pipeline = leads.reduce((s, l) => s + (l.estimated_value || 0), 0)
  const readyContent = CONTENT_PIPELINE.filter(c => c.status === 'ready').length

  useEffect(() => {
    const seen = sessionStorage.getItem('noire-entrance')
    if (seen) {
      setEntranceDone(true)
      setContentReady(true)
      return
    }
    sessionStorage.setItem('noire-entrance', '1')
    const t1 = setTimeout(() => setEntranceDone(true), 3200)
    const t2 = setTimeout(() => setContentReady(true), 3600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(to bottom, #0a0601, #020202)' }}>
      {/* Entrance Animation */}
      <AnimatePresence>
        {!entranceDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6"
            style={{ background: '#020202' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <NoireLogoBadge size={140} />
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60px' }}
              transition={{ duration: 1.2, delay: 1, ease: 'easeOut' }}
              className="h-px bg-[#d4af7a]"
            />
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-[10px] uppercase tracking-[0.5em] text-[#888]"
            >
              Identity Architecture
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="px-4 py-6 space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#d4af7a]/60 mb-2">Identity Architecture</p>
            <div className="flex items-center gap-3">
              <NoireLogoBadge size={44} />
              <h1 className="text-3xl font-light tracking-[0.3em] text-[#f0ede8] uppercase">NOIRE</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#444] uppercase tracking-widest">Season</p>
            <p className="text-xs text-[#d4af7a]">{selectedSeason.name}</p>
          </div>
        </div>

        {/* Brand Vitals */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4">
            <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-1">Inventory</p>
            <p className="text-xl font-light text-[#d4af7a]">{formatCurrency(totalInventoryValue)}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4">
            <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-1">Pipeline</p>
            <p className="text-xl font-light text-[#f0ede8]">{formatCurrency(pipeline)}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4">
            <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-1">Hot Leads</p>
            <p className="text-xl font-light text-yellow-400">{hotLeads}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4">
            <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] mb-1">Ready to Post</p>
            <p className="text-xl font-light text-green-400">{readyContent}</p>
          </div>
        </div>

        {/* Season Board */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#3a3a3a] mb-3">Season Planning</p>
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
            {SEASONS.map(season => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2 rounded-lg border text-xs uppercase tracking-widest transition-all',
                  selectedSeason.id === season.id
                    ? 'border-[#d4af7a]/50 text-[#d4af7a] bg-[#d4af7a]/10'
                    : 'border-[#1c1c1c] text-[#3a3a3a]'
                )}
              >
                {season.name}
              </button>
            ))}
          </div>

          <div className="bg-[#0a0a0a] border border-[#d4af7a]/15 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] text-[#3a3a3a] uppercase tracking-widest">{selectedSeason.period}</p>
                <h3 className="text-lg font-light text-[#f0ede8] mt-1">{selectedSeason.name}</h3>
              </div>
              <span className={clsx('text-[9px] uppercase tracking-wider px-2 py-1 rounded border',
                selectedSeason.status === 'current' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
                selectedSeason.status === 'planning' ? 'text-[#d4af7a] border-[#d4af7a]/30 bg-[#d4af7a]/10' :
                'text-[#3a3a3a] border-[#1c1c1c]'
              )}>{selectedSeason.status}</span>
            </div>
            <p className="text-xs text-[#888] italic mb-4">"{selectedSeason.theme}"</p>
            <p className="text-[10px] text-[#d4af7a] uppercase tracking-wider mb-1">Goal</p>
            <p className="text-xs text-[#888] mb-4">{selectedSeason.goal}</p>
            {selectedSeason.drops.length > 0 && (
              <>
                <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider mb-2">Drops</p>
                <div className="space-y-1.5 mb-4">
                  {selectedSeason.drops.map((drop, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[#888]">{drop.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3a3a3a]">{drop.date}</span>
                        <span className={clsx('text-[9px] uppercase px-1.5 py-0.5 rounded border',
                          drop.status === 'live' ? 'text-green-400 border-green-400/30' :
                          drop.status === 'planning' ? 'text-[#d4af7a] border-[#d4af7a]/30' :
                          'text-[#3a3a3a] border-[#1c1c1c]'
                        )}>{drop.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedSeason.content.length > 0 && (
              <>
                <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider mb-2">Content</p>
                {selectedSeason.content.map((c, i) => (
                  <p key={i} className="text-xs text-[#555] flex items-center gap-2 mb-1">
                    <span className="text-[#d4af7a]">◆</span>{c}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>

        {/* AI Command Center */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#3a3a3a] mb-3">Command — AI Agents</p>
          <div className="grid grid-cols-2 gap-2">
            {AGENTS.map(agent => (
              <motion.button
                key={agent.code}
                onClick={() => setSelectedAgent(agent)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4 text-left hover:border-[#d4af7a]/20 transition-colors relative"
              >
                {agent.pulse && (
                  <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                )}
                <p className="text-xl font-serif" style={{ color: agent.color }}>{agent.code}</p>
                <p className="text-[9px] text-[#3a3a3a] uppercase tracking-wider mt-0.5">{agent.dept}</p>
                <p className="text-[10px] text-[#555] mt-2 leading-relaxed line-clamp-2">{agent.status}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content Pipeline */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#3a3a3a] mb-3">Content Pipeline</p>
          <div className="space-y-2">
            {CONTENT_PIPELINE.map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#f0ede8]">{item.title}</p>
                  <p className="text-[10px] text-[#3a3a3a] mt-0.5">{item.format} · {item.lane}</p>
                </div>
                <span className={clsx('text-[9px] uppercase tracking-wider px-2 py-1 rounded border flex-shrink-0 ml-3', STATUS_COLORS[item.status])}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Pipeline */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] uppercase tracking-widest text-[#3a3a3a]">Lead Pipeline</p>
            <button onClick={() => setAddModal('lead')} className="flex items-center gap-1 text-[10px] text-[#d4af7a]">
              <Plus size={10} />Add Lead
            </button>
          </div>
          <div className="space-y-2">
            {leads.map(lead => (
              <Card
                key={lead.id}
                variant={lead.status === 'hot' ? 'opportunity' : 'default'}
                className="p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-primary font-medium">{lead.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{lead.interest}</p>
                    {lead.platform && <p className="text-[10px] text-text-muted mt-0.5">{lead.platform}</p>}
                    {lead.note && <p className="text-xs text-text-muted mt-1">{lead.note}</p>}
                  </div>
                  <div className="text-right ml-3">
                    {lead.estimated_value && (
                      <p className="text-accent font-medium">{formatCurrency(lead.estimated_value)}</p>
                    )}
                    <StatusBadge status={lead.status} className="mt-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* The Vision */}
        <div className="bg-[#0a0a0a] border border-[#d4af7a]/10 rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#d4af7a]/50 mb-5">The Vision</p>
          <div className="space-y-3">
            {VISION_LINES.map((line, i) => (
              <p key={i} className="text-xs text-[#555] leading-relaxed flex items-start gap-3">
                <span className="text-[#d4af7a]/40 mt-0.5 flex-shrink-0">◆</span>
                {line}
              </p>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Agent Detail Modal */}
      <Modal isOpen={!!selectedAgent} onClose={() => setSelectedAgent(null)} title={selectedAgent ? `${selectedAgent.code} — ${selectedAgent.dept}` : ''}>
        {selectedAgent && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <p className="text-4xl font-serif" style={{ color: selectedAgent.color }}>{selectedAgent.code}</p>
              <div className="ml-auto flex items-center gap-2">
                <span className={clsx('w-2 h-2 rounded-full', selectedAgent.pulse ? 'bg-green-400 animate-pulse' : 'bg-[#3a3a3a]')} />
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{selectedAgent.pulse ? 'Active' : 'Idle'}</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed border-l-2 border-accent/30 pl-3">{selectedAgent.status}</p>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
                ◆ Approvals Needed
              </p>
              <div className="space-y-2">
                {selectedAgent.approvals.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-surface-2 rounded-lg border border-accent/15">
                    <span className="text-accent text-[10px] mt-0.5 flex-shrink-0">→</span>
                    <p className="text-xs text-text-secondary">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Need to Know</p>
              <div className="space-y-2">
                {selectedAgent.needToKnow.map((n, i) => (
                  <p key={i} className="text-xs text-text-muted flex items-start gap-2">
                    <span className="text-[#d4af7a]/50 flex-shrink-0 mt-0.5">◆</span>
                    {n}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Lead Modal */}
      <Modal isOpen={addModal === 'lead'} onClose={() => setAddModal(null)} title="Add Noire Lead">
        <QuickAddForm
          fields={leadFields}
          onSubmit={data => {
            setLeads(prev => [...prev, { id: `lead-${Date.now()}`, user_id: 'demo', name: String(data.name), contact: data.contact ? String(data.contact) : null, platform: data.platform ? String(data.platform) : null, interest: data.interest ? String(data.interest) : null, status: (data.status as 'new') || 'new', estimated_value: data.estimated_value ? Number(data.estimated_value) : null, note: data.note ? String(data.note) : null, created_at: new Date().toISOString() }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Lead"
        />
      </Modal>
    </div>
  )
}
