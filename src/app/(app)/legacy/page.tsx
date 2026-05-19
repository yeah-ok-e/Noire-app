'use client'

import { useState } from 'react'
import { Plus, CheckCircle, Play, Music, Film, FileText, Clock, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'

const DEMO_ERAS = [
  {
    id: 'era-1',
    name: 'Pressure Era',
    description: 'Building under maximum constraint. Rent overdue. Car down. Income unstable. But the clarity is sharper than it\'s ever been. This is the chapter where everything was built from nothing — and the nothing is what makes it unbreakable.',
    is_current: true,
    theme: 'Resilience under pressure',
    color: '#c0392b',
    start_date: '2025-01-01',
    drops: ['Noire — Origin Series Hoodie (May 2026)', 'Graphic Tee Drop 001 (June 2026)'],
    milestones: ['First paid Noire order', 'System goes live (this moment)', 'LIHEAP assistance confirmed', 'First $500 revenue month'],
    soundtrack: 'God\'s Plan — Drake / Never Lose — Burna Boy',
  },
]

const DEMO_ENTRIES = [
  {
    id: 'entry-1',
    title: "Why I'm Still Building",
    entry_type: 'journal',
    content: "There is a certain clarity that comes from having nothing to fall back on. When the safety net is gone, you see the rope you're walking with more precision than ever. Every step matters. Every dollar matters. Every conversation matters.\n\nI'm building Noire with the lights almost off. Not metaphorically — literally. But here's what they don't tell you about constraint: it is also a filter. Only the things that are truly worth doing survive it. Everything optional falls away. What remains is essential.\n\nThis is the Pressure Era. And I wouldn't trade it.",
    tags: ['noire', 'resilience', 'foundation', 'pressure-era'],
    soundtrack: "God's Plan — Drake",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'entry-2',
    title: 'Letter to the Kids — Season One',
    entry_type: 'letter',
    content: "By the time you read this, you'll know whether the pressure built character or broke something. I believe it built you — because it's building me.\n\nThe season you were born into wasn't easy. Your father was building a brand with no money, keeping a system running on belief alone, trying to make something real out of nothing but vision and grit. But here's what I want you to understand:\n\nThe difficulty was the point. Not the obstacle — the curriculum. Every hard thing I went through in the Pressure Era was a lesson I'd eventually teach you. So in a real sense, you were there for all of it — I was building your future while surviving my present.\n\nNoire is yours too. Legacy OS is yours too. This system — encrypted, protected, running quietly behind the scenes — I built it for you as much as for me.\n\nI love you beyond measure. I'm going to make you proud.\n\nDad.",
    tags: ['family', 'legacy', 'future', 'letters', 'pressure-era'],
    soundtrack: 'Never Lose — Burna Boy',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'entry-3',
    title: 'Noire — How It Started',
    entry_type: 'documentary_note',
    content: "It started with a single hoodie and a vision that didn't make sense on paper. No investors. No cosign. No background in fashion. Just a standard that wouldn't compromise and a season too hard to forget.\n\nThe first sample was worn during the hardest week of my life. Rent overdue. Car down. And somehow — standing in that piece — I felt exactly who I was supposed to become.\n\nNoire isn't clothing. It's architecture. Every drop is a chapter. Every piece carries the weight of what it cost to make it. That cost — financial, emotional, spiritual — is what makes it different from everything else on the market.\n\nCOGS: ~$90. Price: $195–215. The difference isn't margin — it's meaning. We charge for the vision, the restraint, the refusal to compromise. And we always will.",
    tags: ['noire', 'origin', 'brand', 'founding-story'],
    soundtrack: 'Otherside — Mac Miller',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'entry-4',
    title: 'The System — Why I Built It',
    entry_type: 'vision',
    content: "I built Legacy OS because no tool existed that understood the complexity of building something real from scratch while managing a family, protecting a brand, and trying not to drown.\n\nEvery other system was built for someone who already had stability. I needed something built for someone who was building it.\n\nThe vision: one system. Every domain of my life — money, health, family, brand, legacy — managed intelligently, privately, all feeding one purpose. Not a collection of apps. Not a dashboard. A living operating system.\n\nAnd eventually: closed circuit. No dependency on external infrastructure. Self-sufficient. Evolving. Protecting the family long after I'm gone.\n\nAlfred is the final form. This is the foundation.",
    tags: ['legacy-os', 'system', 'vision', 'alfred', 'future'],
    soundtrack: 'All Falls Down — Kanye West',
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
]

const CONTENT_LANES = [
  {
    lane: 'Short-Form', icon: Play, status: 'active', description: 'Reels, posts, clips — the daily signal', color: 'text-green-400', count: 3,
    nextAction: 'Post 2x this week minimum — Tuesday and Thursday perform best for luxury streetwear',
    items: ['Brand Manifesto Quote Card (ready)', 'BTS Footage — Sample Fitting (ready)', 'Brand Story Reel Script (draft)'],
    platform: '@noireuniform, @yeah.ok.e',
  },
  {
    lane: 'Long-Form', icon: FileText, status: 'active', description: 'Essays, memoirs, think pieces', color: 'text-blue-400', count: 2,
    nextAction: 'The "Building Noire with the lights almost off" essay is ready — approve and publish',
    items: ['"Building Noire With the Lights Almost Off" (ready)', '"The Architecture of Restraint" (draft)'],
    platform: 'Substack / Instagram caption format',
  },
  {
    lane: 'Documentary', icon: Film, status: 'building', description: 'Film, series, montage — the long arc', color: 'text-purple-400', count: 1,
    nextAction: 'Collect 30–60 seconds of raw BTS footage from the next drop prep. Don\'t stage it — just capture.',
    items: ['Season 1: "The Pressure Era" — in production', 'Teaser trailer — draft script ready'],
    platform: 'YouTube, film festivals eventually',
  },
  {
    lane: 'Sonic', icon: Music, status: 'building', description: 'The score to the legacy', color: 'text-accent', count: 3,
    nextAction: 'Approve "Pressure (Instrumental)" — it\'s ready. Deploy to streaming with one click.',
    items: ['Pressure (Instrumental) — review', 'Foundation — draft', 'Emergence — concept'],
    platform: 'Streaming platforms via distribution',
  },
]

const REVIEW_QUEUE = [
  {
    id: 'rq-1',
    title: '"Building Noire With the Lights Almost Off"',
    type: 'long-form',
    status: 'ready',
    origin: 'Drawn from the Pressure Era journal — the real version of what this season feels like',
    preview: "It wasn't a clean story. The lights were almost off. Not metaphorically. The rent was overdue, the car was down, and somehow — in the middle of all of it — a brand was being built that had no business existing. That impossibility is the point.",
  },
  {
    id: 'rq-2',
    title: '"The First Sample" — Brand Story Reel',
    type: 'short-form',
    status: 'ready',
    origin: 'Based on the actual origin of Noire — the first hoodie worn during the hardest week',
    preview: "It wasn't born in a studio. No investors. No cosign. Just a vision too clear to ignore and a season too hard to forget. The first sample changed everything. Not what it was — what it meant.",
  },
  {
    id: 'rq-3',
    title: 'Season 1 Documentary Teaser — 45 seconds',
    type: 'documentary',
    status: 'draft',
    origin: 'Opening frames of the Pressure Era film — establishes the stakes before a single word is spoken',
    preview: "No narration. No filter. A man building a brand during the hardest season of his life. The camera finds the work — not the performance of it.",
  },
]

const MUSIC_TRACKS = [
  {
    id: 'mt-1', title: 'Pressure (Instrumental)', mood: 'Drive / Focus', duration: '3:42', status: 'review',
    influences: 'Metro Boomin + Hanz Zimmer',
    note: 'Score for the Pressure Era chapter. Use as background for the documentary and brand reels.',
  },
  {
    id: 'mt-2', title: 'Foundation', mood: 'Reflective / Late Night', duration: '4:15', status: 'draft',
    influences: 'Gunna + Frank Ocean vibes',
    note: 'For the letter-writing sessions and legacy content. Quiet, deliberate energy.',
  },
  {
    id: 'mt-3', title: 'Emergence', mood: 'Victory / Ascension', duration: '—', status: 'concept',
    influences: 'Drake × Travis Scott × Hanz Zimmer',
    note: 'The sound of the next era. Save it for the Emergence chapter.',
  },
]

const AFFIRMATION = "I'm AMAZING, I'm UNSTOPPABLE and nothing can get in my way. I'm a LOVING and COMPASSIONATE being that is not led astray. I'm MIND, BODY and SPIRIT and careful with what I say. I'm WISE, WORTHY, WEALTHY and WORRY FREE for I've had a better day today than I did yesterday. I'm him. The Coldest MF Alive. Continue to Lead with Vigor, Act with Valor, and remain Victorious. God got me, My name's Eligah."

const DAILY_PROMPTS = {
  morning: [
    'What does today need to look like for you to be proud of it at midnight?',
    'What is the single most important move to make before noon?',
    'Who do you need to become today that you weren\'t yesterday?',
    'Describe this chapter of your life cinematically — like you\'re watching the film.',
  ],
  evening: [
    'What happened today that future you needs to know about?',
    'What would your children need to understand about this particular day 20 years from now?',
    'What changed in your understanding of yourself or the world today?',
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
  const [activeTab, setActiveTab] = useState<'daily' | 'archive' | 'pipeline'>('daily')
  const [affirmExpanded, setAffirmExpanded] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [selected, setSelected] = useState<typeof DEMO_ENTRIES[0] | null>(null)
  const [selectedEra, setSelectedEra] = useState<typeof DEMO_ERAS[0] | null>(null)
  const [selectedLane, setSelectedLane] = useState<typeof CONTENT_LANES[0] | null>(null)
  const [promptType, setPromptType] = useState<'morning' | 'evening'>('morning')
  const [promptIdx] = useState(() => Math.floor(Math.random() * 4))
  const [approvedItems, setApprovedItems] = useState<string[]>([])
  const [publishedItems, setPublishedItems] = useState<string[]>([])
  const [selectedQueueItem, setSelectedQueueItem] = useState<typeof REVIEW_QUEUE[0] | null>(null)

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

      {/* Current Era — clickable */}
      {DEMO_ERAS.filter(e => e.is_current).map(era => (
        <button
          key={era.id}
          onClick={() => setSelectedEra(era)}
          className="w-full text-left bg-surface border rounded-lg p-5 relative overflow-hidden hover:border-opacity-60 transition-colors"
          style={{ borderColor: era.color + '40' }}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${era.color}, transparent)` }} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">Active Era</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted">{formatDate(era.start_date)} — Present</span>
                <ChevronRight size={11} className="text-text-muted" />
              </div>
            </div>
            <h2 className="text-xl font-light text-text-primary mt-2">{era.name}</h2>
            <p className="text-xs text-text-secondary mt-2 line-clamp-2">{era.description}</p>
            {era.theme && <p className="text-[10px] mt-2" style={{ color: era.color }}>Theme: {era.theme}</p>}
          </div>
        </button>
      ))}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
        {(['daily', 'archive', 'pipeline'] as const).map(tab => (
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

          {/* Daily Affirmation */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Daily Affirmation</p>
            <button
              onClick={() => setAffirmExpanded(!affirmExpanded)}
              className="w-full bg-surface border border-accent/15 rounded-xl p-5 text-left hover:border-accent/30 transition-colors"
            >
              <p className={clsx('text-sm text-text-secondary leading-relaxed italic transition-all', !affirmExpanded && 'line-clamp-3')}>
                "{AFFIRMATION}"
              </p>
              <p className="text-[10px] text-accent mt-3 uppercase tracking-wider">
                {affirmExpanded ? 'Close' : 'Read full'}
              </p>
            </button>
          </div>

          {/* Stats — clickable */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Entries', value: entries.length, onClick: () => setActiveTab('archive') },
              { label: 'Eras', value: DEMO_ERAS.length, onClick: () => setSelectedEra(DEMO_ERAS[0]) },
              { label: 'Legacy Score', value: '74', onClick: undefined },
            ].map(stat => (
              <button
                key={stat.label}
                onClick={stat.onClick}
                className={clsx('bg-surface border border-border rounded-xl p-3 text-center transition-colors', stat.onClick ? 'hover:border-accent/30' : 'cursor-default')}
              >
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">{stat.label}</p>
                <p className="text-lg font-light text-accent">{stat.value}</p>
              </button>
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
                  className="w-full bg-surface border border-border rounded-lg p-4 text-left hover:border-[#2a2a2a] transition-colors"
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
              className="w-full bg-surface border border-border rounded-lg p-4 text-left hover:border-[#2a2a2a] transition-colors"
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
        <div className="space-y-6">
          {/* Content Lanes — clickable */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Content Lanes</p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_LANES.map(lane => {
                const Icon = lane.icon
                return (
                  <button
                    key={lane.lane}
                    onClick={() => setSelectedLane(lane)}
                    className="bg-surface border border-border rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} className={lane.color} />
                      <p className="text-xs font-medium text-text-primary">{lane.lane}</p>
                    </div>
                    <p className="text-[10px] text-text-muted mb-2 line-clamp-1">{lane.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={clsx('text-[9px] uppercase tracking-wider', lane.status === 'active' ? 'text-green-400' : 'text-text-muted')}>{lane.status}</span>
                      <span className="text-[10px] text-text-muted">{lane.count} items</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Review Queue */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Review Queue</p>
            <p className="text-xs text-text-muted mb-3">AI-generated content drawn from your real story. Tap to review. Approve → Deploy.</p>
            <div className="space-y-3">
              {REVIEW_QUEUE.map(item => (
                <div key={item.id} className="bg-surface border border-border rounded-xl p-4">
                  <button onClick={() => setSelectedQueueItem(item)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm text-text-primary font-medium">{item.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5 italic">{item.origin}</p>
                      </div>
                      <span className={clsx('text-[9px] uppercase tracking-wider flex-shrink-0', item.status === 'ready' ? 'text-green-400' : 'text-text-muted')}>{item.status}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">"{item.preview}"</p>
                  </button>
                  <div className="flex gap-2 mt-3">
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

          {/* Sonic Pipeline */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Music size={11} className="text-accent" />
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Sonic Pipeline</p>
            </div>
            <p className="text-xs text-text-muted mb-3">
              The score to the legacy. AI-generated from your essence — Drake's intimacy, Future's atmosphere, Hanz Zimmer's pull.
            </p>
            <div className="space-y-2">
              {MUSIC_TRACKS.map(track => (
                <div key={track.id} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-text-primary font-medium">{track.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{track.mood}</p>
                      <p className="text-[10px] text-text-muted mt-1 italic">{track.note}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
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
            <Card variant="glass" className="p-4 mt-3">
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Royalty Pipeline</p>
              <p className="text-xs text-text-muted leading-relaxed">
                Approved tracks deploy to streaming. Agents handle distribution, publishing registration, and sync licensing. Royalties routed to linked account.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Era Detail Modal */}
      <AnimatePresence>
        {selectedEra && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedEra(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[82vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-6 pt-6 pb-4 z-10"
                style={{ borderTopColor: selectedEra.color + '40' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Active Era</p>
                    <p className="text-xl font-light text-text-primary">{selectedEra.name}</p>
                    <p className="text-[10px] mt-1" style={{ color: selectedEra.color }}>{selectedEra.theme}</p>
                  </div>
                  <button onClick={() => setSelectedEra(null)} className="text-text-muted hover:text-text-primary p-1 transition-colors mt-0.5">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-text-muted mt-2">{formatDate(selectedEra.start_date)} — Present</p>
              </div>
              <div className="px-6 pb-8 pt-4 space-y-5">
                <p className="text-sm text-text-secondary leading-relaxed">{selectedEra.description}</p>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Drops This Era</p>
                  {selectedEra.drops.map((drop, i) => (
                    <p key={i} className="text-xs text-text-secondary flex items-start gap-2 mb-1.5">
                      <span className="text-accent flex-shrink-0 mt-0.5">◆</span>{drop}
                    </p>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Era Milestones</p>
                  {selectedEra.milestones.map((m, i) => (
                    <p key={i} className="text-xs text-text-secondary flex items-start gap-2 mb-1.5">
                      <span className="text-text-muted flex-shrink-0">—</span>{m}
                    </p>
                  ))}
                </div>

                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5">Era Soundtrack</p>
                  <p className="text-xs text-text-secondary">♫ {selectedEra.soundtrack}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Lane Detail Modal */}
      <AnimatePresence>
        {selectedLane && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedLane(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[75vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-6 pt-6 pb-4 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {(() => { const Icon = selectedLane.icon; return <Icon size={18} className={selectedLane.color} /> })()}
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-text-muted">Content Lane</p>
                      <p className="text-lg font-medium text-text-primary">{selectedLane.lane}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLane(null)} className="text-text-muted hover:text-text-primary p-1 transition-colors mt-0.5">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="px-6 pb-8 pt-4 space-y-5">
                <p className="text-sm text-text-secondary leading-relaxed">{selectedLane.description}</p>

                <div className="bg-surface border border-accent/15 rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-wider text-accent mb-1.5">Next Action</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{selectedLane.nextAction}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Items in This Lane</p>
                  {selectedLane.items.map((item, i) => (
                    <p key={i} className="text-xs text-text-secondary flex items-start gap-2 mb-1.5">
                      <span className="text-text-muted flex-shrink-0 mt-0.5">—</span>{item}
                    </p>
                  ))}
                </div>

                <div className="bg-surface border border-border rounded-xl p-3">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Platform</p>
                  <p className="text-xs text-text-secondary">{selectedLane.platform}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Queue Item Detail */}
      <AnimatePresence>
        {selectedQueueItem && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedQueueItem(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[75vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-6 pt-6 pb-4 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1">{selectedQueueItem.type} — Review</p>
                    <p className="text-base font-medium text-text-primary leading-tight">{selectedQueueItem.title}</p>
                  </div>
                  <button onClick={() => setSelectedQueueItem(null)} className="text-text-muted hover:text-text-primary p-1 transition-colors mt-0.5">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="px-6 pb-8 pt-4 space-y-5">
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5">Origin</p>
                  <p className="text-xs text-text-secondary italic leading-relaxed">{selectedQueueItem.origin}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Preview</p>
                  <p className="text-sm text-text-secondary leading-relaxed italic">"{selectedQueueItem.preview}"</p>
                </div>
                <div className="flex gap-2">
                  {publishedItems.includes(selectedQueueItem.id) ? (
                    <div className="flex-1 py-3 rounded-xl bg-green-400/10 border border-green-400/30 text-green-400 text-sm text-center flex items-center justify-center gap-2">
                      <CheckCircle size={14} />Published
                    </div>
                  ) : approvedItems.includes(selectedQueueItem.id) ? (
                    <button onClick={() => { setPublishedItems(prev => [...prev, selectedQueueItem.id]); setSelectedQueueItem(null) }} className="flex-1 py-3 rounded-xl bg-accent/15 border border-accent/50 text-accent text-sm hover:bg-accent/25 transition-all">
                      Deploy Now
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setApprovedItems(prev => [...prev, selectedQueueItem.id]); setSelectedQueueItem(null) }} className="flex-1 py-3 rounded-xl border border-accent/40 text-accent text-sm hover:bg-accent/10 transition-all">Approve</button>
                      <button className="flex-1 py-3 rounded-xl border border-border text-text-secondary text-sm hover:bg-surface-2 transition-all">Edit</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[88vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-6 pt-6 pb-4 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 bg-surface-2 text-text-muted rounded uppercase tracking-wider">{TYPE_LABELS[selected.entry_type]}</span>
                    <p className="text-lg font-medium text-text-primary mt-1 leading-tight">{selected.title}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{formatDate(selected.created_at)}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary p-1 transition-colors mt-0.5">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="px-6 pb-8 pt-4 space-y-4">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{selected.content}</p>
                {selected.soundtrack && (
                  <div className="bg-surface border border-border rounded-lg p-3">
                    <p className="text-xs text-accent">♫ {selected.soundtrack}</p>
                  </div>
                )}
                {selected.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 bg-surface-2 border border-border text-text-muted rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
