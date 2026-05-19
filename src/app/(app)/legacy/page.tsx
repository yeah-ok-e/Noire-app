'use client'
import { useState } from 'react'
import { Plus, BookOpen, Pen, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { formatDate } from '@/lib/utils/formatters'
import type { FormField } from '@/types/app'

const DEMO_ERAS = [
  {
    id: 'era-1',
    name: 'Pressure Era',
    description: 'Building under maximum constraint. Rent overdue, car down, income unstable. But the clarity is sharp.',
    is_current: true,
    theme: 'Resilience under pressure',
    color: '#c0392b',
    start_date: '2025-01-01',
  },
]

const DEMO_ENTRIES = [
  {
    id: 'entry-1',
    title: 'Why I\'m Still Building',
    entry_type: 'journal',
    content: 'There is a certain clarity that comes from having nothing to fall back on. When the safety net is gone, you see the rope you\'re walking more clearly than ever...',
    tags: ['noire', 'resilience', 'foundation'],
    soundtrack: 'God\'s Plan — Drake',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'entry-2',
    title: 'Letter to Future Marcus',
    entry_type: 'letter',
    content: 'By the time you read this, you\'ll know whether the pressure built character or broke something. I believe it built you...',
    tags: ['family', 'legacy', 'future'],
    soundtrack: 'Never Lose — Burna Boy',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'entry-3',
    title: 'Noire Origin Story',
    entry_type: 'documentary_note',
    content: 'It started with a hoodie and a vision. Not clothing — architecture. The first sample was worn during the hardest week of my life...',
    tags: ['noire', 'origin', 'brand'],
    soundtrack: 'Otherside — Mac Miller',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
]

const ENTRY_FIELDS: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'entry_type', label: 'Type', type: 'select', required: true, options: [
    { value: 'journal', label: 'Journal' }, { value: 'memoir', label: 'Memoir' },
    { value: 'letter', label: 'Letter' }, { value: 'poem', label: 'Poem' },
    { value: 'essay', label: 'Essay' }, { value: 'milestone', label: 'Milestone' },
    { value: 'documentary_note', label: 'Documentary Note' }, { value: 'reflection', label: 'Reflection' },
    { value: 'vision', label: 'Vision' },
  ]},
  { name: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Write your entry...' },
  { name: 'soundtrack', label: 'Soundtrack', type: 'text', placeholder: 'Song that scores this moment' },
  { name: 'tags', label: 'Tags', type: 'text', placeholder: 'noire, family, resilience (comma-separated)' },
]

const TYPE_LABELS: Record<string, string> = {
  journal: 'Journal', memoir: 'Memoir', letter: 'Letter', poem: 'Poem',
  essay: 'Essay', milestone: 'Milestone', documentary_note: 'Doc Note',
  reflection: 'Reflection', vision: 'Vision',
}

export default function LegacyPage() {
  const [entries, setEntries] = useState(DEMO_ENTRIES)
  const [addModal, setAddModal] = useState(false)
  const [selected, setSelected] = useState<typeof DEMO_ENTRIES[0] | null>(null)
  const [filterType, setFilterType] = useState('all')

  const filtered = entries.filter(e => filterType === 'all' || e.entry_type === filterType)

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Current Era */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#444] mb-3">Current Era</p>
        {DEMO_ERAS.filter(e => e.is_current).map(era => (
          <div key={era.id} className="bg-[#111] border rounded-lg p-5 relative overflow-hidden" style={{ borderColor: era.color + '40' }}>
            <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${era.color}, transparent)` }} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Active Era</p>
                <span className="text-[10px] text-[#444]">{formatDate(era.start_date)} — Present</span>
              </div>
              <h2 className="text-xl font-light text-[#f0ede8] mt-2">{era.name}</h2>
              <p className="text-xs text-[#888] mt-2">{era.description}</p>
              {era.theme && <p className="text-[10px] mt-2" style={{ color: era.color }}>Theme: {era.theme}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Legacy Score */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Entries', value: entries.length },
          { label: 'Eras', value: DEMO_ERAS.length },
          { label: 'Legacy Score', value: '74' },
        ].map(stat => (
          <Card key={stat.label} className="p-3 text-center">
            <p className="text-[9px] uppercase tracking-wider text-[#444] mb-1">{stat.label}</p>
            <p className="text-lg font-light text-[#d4af7a]">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Entries */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-[#444]">Archive</p>
          <button onClick={() => setAddModal(true)} className="flex items-center gap-1 text-[10px] text-[#d4af7a]">
            <Plus size={10} />New Entry
          </button>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-3">
          {['all', 'journal', 'letter', 'milestone', 'documentary_note', 'poem', 'reflection'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                filterType === type
                  ? 'border-[#d4af7a]/60 text-[#d4af7a] bg-[#d4af7a]/10'
                  : 'border-[#222] text-[#444]'
              }`}
            >
              {type === 'all' ? 'All' : TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(entry => (
            <motion.button
              key={entry.id}
              onClick={() => setSelected(entry)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg p-4 text-left hover:border-[#2a2a2a] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#1a1a1a] text-[#555] rounded uppercase tracking-wider">
                      {TYPE_LABELS[entry.entry_type] || entry.entry_type}
                    </span>
                  </div>
                  <p className="text-sm text-[#f0ede8] font-medium">{entry.title}</p>
                  <p className="text-xs text-[#555] mt-1 line-clamp-2">{entry.content}</p>
                  {entry.soundtrack && (
                    <p className="text-[10px] text-[#444] mt-1.5">♫ {entry.soundtrack}</p>
                  )}
                </div>
                <p className="text-[10px] text-[#333] flex-shrink-0">{formatDate(entry.created_at)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Capture Prompts */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#444] mb-3">Capture Prompts</p>
        <div className="space-y-2">
          {[
            'Describe today cinematically.',
            'What pressure are you carrying right now?',
            'What would your future son need to understand about this season?',
            'What song scores this moment, and why?',
            'What changed your trajectory this week?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => setAddModal(true)}
              className="w-full text-left px-4 py-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg text-xs text-[#555] hover:text-[#888] hover:border-[#2a2a2a] transition-all"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Entry Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2 py-1 bg-[#1a1a1a] text-[#888] rounded uppercase tracking-wider">
                {TYPE_LABELS[selected.entry_type]}
              </span>
              <span className="text-[10px] text-[#444]">{formatDate(selected.created_at)}</span>
            </div>
            <p className="text-sm text-[#888] leading-relaxed">{selected.content}</p>
            {selected.soundtrack && (
              <p className="text-xs text-[#d4af7a]">♫ {selected.soundtrack}</p>
            )}
            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#1a1a1a] text-[#444] rounded">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Entry Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="New Legacy Entry">
        <QuickAddForm
          fields={ENTRY_FIELDS}
          onSubmit={data => {
            setEntries(prev => [...prev, {
              id: `entry-${Date.now()}`,
              title: String(data.title),
              entry_type: String(data.entry_type),
              content: String(data.content),
              tags: String(data.tags || '').split(',').map(t => t.trim()).filter(Boolean),
              soundtrack: String(data.soundtrack || ''),
              created_at: new Date().toISOString(),
            }])
            setAddModal(false)
          }}
          onCancel={() => setAddModal(false)}
          submitLabel="Save to Archive"
        />
      </Modal>
    </div>
  )
}
