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
  { code: 'CEO', color: '#d4af7a', status: 'Brand vision aligned — 2 decisions pending review', dept: 'Executive', pulse: true },
  { code: 'CMO', color: '#a78bfa', status: 'Drop announcement sequence drafted — ready to deploy', dept: 'Marketing', pulse: true },
  { code: 'CRO', color: '#facc15', status: '3 hot leads in pipeline — follow-up due Thursday', dept: 'Revenue', pulse: true },
  { code: 'CCO', color: '#f472b6', status: 'Origin Series mockups in progress — est. 5 days', dept: 'Creative', pulse: false },
  { code: 'CFO', color: '#4ade80', status: 'Margin analysis complete — recommend $285 price point', dept: 'Finance', pulse: false },
  { code: 'COO', color: '#f0ede8', status: 'Fulfillment workflow mapped — awaiting first bulk order', dept: 'Operations', pulse: false },
  { code: 'CBO', color: '#d4af7a', status: 'Identity guide v2 — 80% complete', dept: 'Brand', pulse: false },
  { code: 'CTO', color: '#60a5fa', status: 'Shopify store optimization queued', dept: 'Technology', pulse: false },
]

const CONTENT_PIPELINE = [
  { title: 'Brand Manifesto Quote Card', lane: 'short-form', status: 'ready', format: 'Visual' },
  { title: 'BTS Footage — Sample Fitting', lane: 'short-form', status: 'ready', format: 'Video' },
  { title: '"Why I Build" Essay', lane: 'long-form', status: 'review', format: 'Written' },
  { title: 'Origin Story Documentary', lane: 'film', status: 'production', format: 'Film' },
  { title: 'Season Lookbook', lane: 'visual', status: 'production', format: 'Photo' },
  { title: 'Brand Story Video Script', lane: 'short-form', status: 'draft', format: 'Video' },
]

const STATUS_COLORS: Record<string, string> = {
  ready: 'text-green-400 border-green-400/30 bg-green-400/10',
  review: 'text-accent border-accent/30 bg-accent/10',
  production: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  draft: 'text-text-muted border-border bg-surface-2',
}

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
    const t1 = setTimeout(() => setEntranceDone(true), 2800)
    const t2 = setTimeout(() => setContentReady(true), 3200)
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
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: '#020202' }}
          >
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.05em' }}
              animate={{ opacity: 1, letterSpacing: '0.55em' }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl font-light text-[#f0ede8] uppercase"
            >
              NOIRE
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100px' }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              className="h-px bg-[#d4af7a] mt-5"
            />
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-[10px] uppercase tracking-[0.5em] text-[#888] mt-5"
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
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#d4af7a]/60 mb-2">Identity Architecture</p>
            <h1 className="text-3xl font-light tracking-[0.3em] text-[#f0ede8] uppercase">NOIRE</h1>
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
            {[
              'Cortiez-level hysteria. Drake-level anticipation. A loving, legendary community.',
              'Every drop is performance art. Every moment documented — films, books, posts, montages, think pieces.',
              'Remembered across generations. Across timelines. Like Genghis Khan, Mother Theresa, MJ.',
              'The community is an extension of the family. Every purchase is a moment. Once-in-a-lifetime energy.',
              'The brand is the score to the story. Every collection, a chapter. Every campaign, a movement.',
            ].map((line, i) => (
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
          <div className="space-y-4">
            <p className="text-4xl font-serif" style={{ color: selectedAgent.color }}>{selectedAgent.code}</p>
            <p className="text-text-secondary text-sm">{selectedAgent.status}</p>
            <div className="flex items-center gap-2">
              <span className={clsx('w-2 h-2 rounded-full', selectedAgent.pulse ? 'bg-green-400 animate-pulse' : 'bg-text-muted')} />
              <span className="text-[10px] text-text-muted uppercase tracking-wider">{selectedAgent.pulse ? 'Active' : 'Idle'}</span>
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
