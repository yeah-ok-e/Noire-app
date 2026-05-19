'use client'

import { useState } from 'react'
import { Plus, CheckCircle, Play, Music, Film, FileText, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'

const DEMO_ERAS = [
  { id: 'era-1', name: 'Pressure Era', description: 'Building under maximum constraint. Rent overdue, car down, income unstable. But the clarity is sharp.', is_current: true, theme: 'Resilience under pressure', color: '#c0392b', start_date: '2025-01-01' },
]

const DEMO_ENTRIES = [
  { id: 'entry-1', title: "Why I'm Still Building", entry_type: 'journal', content: "There is a certain clarity that comes from having nothing to fall back on. When the safety net is gone, you see the rope you're walking more clearly than ever...", tags: ['noire', 'resilience', 'foundation'], soundtrack: "God's Plan — Drake", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'entry-2', title: 'Letter to Future Marcus', entry_type: 'letter', content: "By the time you read this, you'll know whether the pressure built character or broke something. I believe it built you...", tags: ['family', 'legacy', 'future'], soundtrack: 'Never Lose — Burna Boy', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'entry-3', title: 'Noire Origin Story', entry_type: 'documentary_note', content: "It started with a hoodie and a vision. Not clothing — architecture. The first sample was worn during the hardest week of my life...", tags: ['noire', 'origin', 'brand'], soundtrack: 'Otherside — Mac Miller', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
]

const CONTENT_LANES = [
  { lane: 'Short-Form', icon: Play, status: 'active', description: 'Reels, posts, clips', color: 'text-green-400', count: 3 },
  { lane: 'Long-Form', icon: FileText, status: 'active', description: 'Essays, memoirs, think pieces', color: 'text-blue-400', count: 2 },
  { lane: 'Documentary', icon: Film, status: 'building', description: 'Film, series, montage', color: 'text-purple-400', count: 1 },
  { lane: 'Music', icon: Music, status: 'building', description: 'AI-generated score to the legacy', color: 'text-accent', count: 1 },
]

const REVIEW_QUEUE = [
  { id: 'rq-1', title: '"The Pressure Era" — Short Essay', type: 'long-form', status: 'ready', preview: "Every era has a sound. The Pressure Era sounds like silence at 3am, the hum of a phone charger that still works, and the particular quiet of a man who knows exactly what he has to do..." },
  { id: 'rq-2', title: 'Brand Story Reel Script', type: 'short-form', status: 'ready', preview: "It wasn't born in a studio. No investors. No cosign. Just a vision too clear to ignore and a season too hard to forget..." },
  { id: 'rq-3', title: 'Season 1 Documentary Teaser', type: 'documentary', status: 'draft', preview: "A man building a brand during the hardest season of his life. No filter. No excuses. Just the work." },
]

const MUSIC_TRACKS = [
  { id: 'mt-1', title: 'Pressure (Instrumental)', mood: 'Drive / Focus', influences: 'Metro Boomin + Hanz Zimmer', status: 'review', duration: '3:42' },
  { id: 'mt-2', title: 'Foundation', mood: 'Reflective', influences: 'Gunna + Frank Ocean vibes', status: 'draft', duration: '4:15' },
  { id: 'mt-3', title: 'Emergence', mood: 'Victory / Ascension', influences: 'Drake × Travis Scott energy', status: 'concept', duration: '—' },
]

const DAILY_PROMPTS = {
  morning: [
    'What does today need to look like for you to be proud of it at midnight?',
    'What is the single most important move to make before noon?',
    'Who do you need to become today that you weren\'t yesterday?',
    'Describe your current chapter cinematically.',
  ],
  evening: [
    'What happened today that future you needs to know about?',
    'What changed in your understanding of the world today?',
    'What would your future son need to know about this particular day?',
    'What song scores this moment, and why?',
  ],
}

const TYPE_LABELS: Record<string, string> = {
  journal: 'Journal', memoir: 'Memoir', letter: 'Letter', poem: 'Poem',
  essay: 'Essay', milestone: 'Milestone', documentary_note: 'Doc Note',
  reflection: 'Reflection', vision: 'Vision',
}

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

export default function LegacyPage() {
  const [entries, setEntries] = useState(DEMO_ENTRIES)
  const [activeTab, setActiveTab] = useState<'daily' | 'archive' | 'pipeline' | 'music'>('daily')
  const [addModal, setAddModal] = useState(false)
  const [selected, setSelected] = useState<typeof DEMO_ENTRIES[0] | null>(null)
  const [promptType, setPromptType] = useState<'morning' | 'evening'>('morning')
  const [promptIdx] = useState(() => Math.floor(Math.random() * 4))
  const [approvedItems, setApprovedItems] = useState<string[]>([])
  const [publishedItems, setPublishedItems] = useState<string[]>([])

  const currentPrompt = DAILY_PROMPTS[promptType][promptIdx % DAILY_PROMPTS[promptType].length]

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary font-serif text-xl">Legacy</h1>
          <p className="text-text-muted text-xs mt-0.5">The record of a life lived at full magnitude</p>
        </div>
        <button onClick={() => setAddModal(true)} className="flex items-center gap-1 text-[10px] text-accent">
          <Plus size={10} />New Entry
        </button>
      </div>

      {/* Current Era */}
      {DEMO_ERAS.filter(e => e.is_current).map(era => (
        <div key={era.id} className="bg-surface border rounded-lg p-5 relative overflow-hidden" style={{ borderColor: era.color + '40' }}>
          <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${era.color}, transparent)` }} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">Active Era</p>
              <span className="text-[10px] text-text-muted">{formatDate(era.start_date)} — Present</span>
            </div>
            <h2 className="text-xl font-light text-text-primary mt-2">{era.name}</h2>
            <p className="text-xs text-text-secondary mt-2">{era.description}</p>
            {era.theme && <p className="text-[10px] mt-2" style={{ color: era.color }}>Theme: {era.theme}</p>}
          </div>
        </div>
      ))}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
        {(['daily', 'archive', 'pipeline', 'music'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all',
              activeTab === tab ? 'bg-surface text-accent border border-border' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daily Tab */}
      {activeTab === 'daily' && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex border border-border rounded-lg overflow-hidden">
                {(['morning', 'evening'] as const).map(t => (
                  <button key={t} onClick={() => setPromptType(t)} className={clsx('px-3 py-1.5 text-xs transition-colors', promptType === t ? 'bg-surface-2 text-accent' : 'text-text-muted')}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Capture Prompt</p>
            </div>
            <div className="bg-surface border border-accent/20 rounded-xl p-5">
              <p className="text-sm text-text-primary leading-relaxed italic mb-4">"{currentPrompt}"</p>
              <button onClick={() => setAddModal(true)} className="flex items-center gap-2 text-xs text-accent border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent/10 transition-all">
                <Plus size={12} />Respond to this prompt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Entries', value: entries.length },
              { label: 'Eras', value: DEMO_ERAS.length },
              { label: 'Legacy Score', value: '74' },
            ].map(stat => (
              <Card key={stat.label} className="p-3 text-center">
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">{stat.label}</p>
                <p className="text-lg font-light text-accent">{stat.value}</p>
              </Card>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Recent</p>
            <div className="space-y-2">
              {entries.slice(0, 3).map(entry => (
                <motion.button
                  key={entry.id}
                  onClick={() => setSelected(entry)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-surface border border-border rounded-lg p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] px-1.5 py-0.5 bg-surface-2 text-text-muted rounded uppercase tracking-wider">{TYPE_LABELS[entry.entry_type] || entry.entry_type}</span>
                      <p className="text-sm text-text-primary font-medium mt-1">{entry.title}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{entry.content}</p>
                      {entry.soundtrack && <p className="text-[10px] text-text-muted mt-1.5">♫ {entry.soundtrack}</p>}
                    </div>
                    <p className="text-[10px] text-text-muted flex-shrink-0">{formatDate(entry.created_at)}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Archive Tab */}
      {activeTab === 'archive' && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">{entries.length} entries</p>
          {entries.map(entry => (
            <motion.button
              key={entry.id}
              onClick={() => setSelected(entry)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-surface border border-border rounded-lg p-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] px-1.5 py-0.5 bg-surface-2 text-text-muted rounded uppercase tracking-wider">{TYPE_LABELS[entry.entry_type] || entry.entry_type}</span>
                  <p className="text-sm text-text-primary font-medium mt-1">{entry.title}</p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{entry.content}</p>
                  {entry.soundtrack && <p className="text-[10px] text-text-muted mt-1.5">♫ {entry.soundtrack}</p>}
                </div>
                <p className="text-[10px] text-text-muted flex-shrink-0">{formatDate(entry.created_at)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Content Lanes</p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_LANES.map(lane => {
                const Icon = lane.icon
                return (
                  <div key={lane.lane} className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} className={lane.color} />
                      <p className="text-xs font-medium text-text-primary">{lane.lane}</p>
                    </div>
                    <p className="text-[10px] text-text-muted mb-2">{lane.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={clsx('text-[9px] uppercase tracking-wider', lane.status === 'active' ? 'text-green-400' : 'text-text-muted')}>{lane.status}</span>
                      <span className="text-[10px] text-text-muted">{lane.count} items</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Review Queue</p>
            <p className="text-xs text-text-muted mb-3">AI-generated content awaiting your review. Approve → Deploy. One button publishes everything.</p>
            <div className="space-y-3">
              {REVIEW_QUEUE.map(item => (
                <div key={item.id} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm text-text-primary font-medium">{item.title}</p>
                      <span className={clsx('text-[9px] uppercase tracking-wider', item.status === 'ready' ? 'text-green-400' : 'text-text-muted')}>{item.status}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-accent border border-accent/30 px-1.5 py-0.5 rounded flex-shrink-0">AI</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-3">"{item.preview}"</p>
                  <div className="flex gap-2">
                    {publishedItems.includes(item.id) ? (
                      <div className="flex-1 py-2 rounded-lg bg-green-400/10 border border-green-400/30 text-green-400 text-xs text-center flex items-center justify-center gap-1">
                        <CheckCircle size={11} />Published
                      </div>
                    ) : approvedItems.includes(item.id) ? (
                      <button onClick={() => setPublishedItems(prev => [...prev, item.id])} className="flex-1 py-2 rounded-lg bg-accent/15 border border-accent/50 text-accent text-xs hover:bg-accent/25 transition-all">
                        Deploy Now
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setApprovedItems(prev => [...prev, item.id])} className="flex-1 py-2 rounded-lg border border-accent/40 text-accent text-xs hover:bg-accent/10 transition-all">Approve</button>
                        <button className="flex-1 py-2 rounded-lg border border-border text-text-secondary text-xs hover:bg-surface-2 transition-all">Edit</button>
                        <button className="py-2 px-3 rounded-lg border border-border text-text-muted text-xs hover:text-crisis hover:border-crisis/30 transition-all">✕</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Music Tab */}
      {activeTab === 'music' && (
        <div className="space-y-5">
          <div className="bg-surface border border-accent/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Music size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">The Artist</p>
                <p className="text-sm text-text-primary font-medium">AI-Generated Legacy Score</p>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  The music is the score to the legacy and the Noire brand. An AI artist built from your essence — Drake's intimacy, Gunna's melody, Future's atmosphere, Kanye's spectacle, Hanz Zimmer's emotional pull, Mike Dean's synthesis.
                </p>
              </div>
            </div>
            <p className="text-[10px] text-accent/60 uppercase tracking-wider">One artist. Every emotion. Crafted for your story.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Track Queue</p>
              <button className="flex items-center gap-1 text-[10px] text-accent"><Plus size={10} />Generate</button>
            </div>
            <div className="space-y-2">
              {MUSIC_TRACKS.map(track => (
                <div key={track.id} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-text-primary font-medium">{track.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{track.mood}</p>
                      <p className="text-[10px] text-text-muted mt-1">Influences: {track.influences}</p>
                    </div>
                    <div className="text-right">
                      <span className={clsx('text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border',
                        track.status === 'review' ? 'text-accent border-accent/30' :
                        track.status === 'draft' ? 'text-blue-400 border-blue-400/30' :
                        'text-text-muted border-border'
                      )}>{track.status}</span>
                      {track.duration !== '—' && (
                        <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1 justify-end">
                          <Clock size={9} />{track.duration}
                        </p>
                      )}
                    </div>
                  </div>
                  {track.status === 'review' && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1.5 rounded-lg border border-border text-text-secondary text-xs flex items-center justify-center gap-1"><Play size={10} />Preview</button>
                      <button className="flex-1 py-1.5 rounded-lg border border-accent/40 text-accent text-xs hover:bg-accent/10 transition-all">Approve</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card variant="glass" className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Royalty Pipeline</p>
            <p className="text-xs text-text-muted leading-relaxed">
              Approved tracks deploy to streaming platforms. AI agents handle distribution, publishing registration, and sync licensing. Royalties flow to linked account — visible on the Money tab.
            </p>
          </Card>
        </div>
      )}

      {/* Entry Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2 py-1 bg-surface-2 text-text-secondary rounded uppercase tracking-wider">{TYPE_LABELS[selected.entry_type]}</span>
              <span className="text-[10px] text-text-muted">{formatDate(selected.created_at)}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{selected.content}</p>
            {selected.soundtrack && <p className="text-xs text-accent">♫ {selected.soundtrack}</p>}
            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selected.tags.map(tag => <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-surface-2 text-text-muted rounded">{tag}</span>)}
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
            setEntries(prev => [...prev, { id: `entry-${Date.now()}`, title: String(data.title), entry_type: String(data.entry_type), content: String(data.content), tags: String(data.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean), soundtrack: String(data.soundtrack || ''), created_at: new Date().toISOString() }])
            setAddModal(false)
          }}
          onCancel={() => setAddModal(false)}
          submitLabel="Save to Archive"
        />
      </Modal>
    </div>
  )
}
