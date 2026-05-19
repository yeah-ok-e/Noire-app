'use client'

import { useState } from 'react'
import { Plus, Home, Users, Heart, Zap, Shield, CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'
import type { HomeIssue } from '@/types/database'

const RELATIONSHIP_AGENTS = [
  {
    id: 'rel-1', name: 'Mary', type: 'Family', accessLevel: 'Core Circle',
    health: 85, daysSince: 3,
    nextAction: 'Sunday call — be present, not performative. She covered your phone. Don\'t let the debt create distance.',
    themes: ['Family news', 'Your progress — give her a real update', 'Honoring what she did'],
    touchPoints: [{ label: 'Sunday call', frequency: 'Weekly' }, { label: 'Share a win', frequency: 'Ongoing' }],
    notes: 'Covered phone bill — $60 owed. Emergency contact. Core support.',
  },
  {
    id: 'rel-2', name: 'Dana', type: 'Friend', accessLevel: 'Inner Circle',
    health: 70, daysSince: 7,
    nextAction: 'Send a check-in text. Keep the energy warm while the debt is pending.',
    themes: ['Life updates', 'What you\'re building', 'Shared history'],
    touchPoints: [{ label: 'Text check-in', frequency: 'Biweekly' }, { label: 'In-person catch-up', frequency: 'Monthly' }],
    notes: 'Personal loan — $100 owed. Trusted friend.',
  },
  {
    id: 'rel-3', name: 'Reggie', type: 'Friend', accessLevel: 'Inner Circle',
    health: 68, daysSince: 10,
    nextAction: 'Keep it real and direct. "I got you" goes a long way.',
    themes: ['The move you\'re making', 'Real talk', 'Shared vision'],
    touchPoints: [{ label: 'Real conversation', frequency: 'Monthly' }, { label: 'Share a win', frequency: 'As available' }],
    notes: 'Personal loan — $100 owed. Real one. Values authenticity.',
  },
]

const PROTECTION_AGENTS = [
  {
    id: 'pa-1', code: 'Insurance', color: '#4ade80', dept: 'Life Insurance', pulse: true,
    status: '$1M term life recommended — research in progress',
    detail: 'Managing life insurance strategy. $1M term life policy minimum. Beneficiaries: the kids. Policy comparison active across top carriers. Monthly premium estimate: ~$45–80.',
    priority: 'Activate within 90 days',
  },
  {
    id: 'pa-2', code: 'Will', color: '#d4af7a', dept: 'Will & Estate', pulse: true,
    status: 'Will framework drafted — awaiting legal execution',
    detail: 'Will framework covers: asset distribution, Noire business succession, guardianship designations for the kids, property transfer, and final instructions. Needs legal execution to become binding.',
    priority: 'Complete within 60 days',
  },
  {
    id: 'pa-3', code: 'Eternal', color: '#a78bfa', dept: 'Life After Death', pulse: false,
    status: 'Digital legacy system active — milestone messages queued',
    detail: 'Letters to the children for: graduation, marriage, first business launch, darkest day, and every birthday through 30. Business succession plan. Noire transition roadmap. Property and financial instructions.',
    priority: 'Build continuously',
  },
  {
    id: 'pa-4', code: 'Alfred', color: '#f0ede8', dept: "Children's Guardian AI", pulse: false,
    status: 'Standby — activates upon verified trigger event',
    detail: 'Alfred is the guardian AI for the children once you\'re gone. Contains everything: your life lessons, financial guidance, business principles, letters from dad, memories, and specific instructions for every major life milestone. He speaks in your voice.',
    priority: 'Begin building now',
  },
]

const KIDS_BUCKET_LIST = [
  { id: 'k1', title: 'Iron Coyote', category: 'Experience' },
  { id: 'k2', title: 'Trampoline Park', category: 'Active' },
  { id: 'k3', title: 'Snowboarding / Skiing', category: 'Adventure' },
  { id: 'k4', title: 'Hawaii', category: 'Travel' },
  { id: 'k5', title: 'Boxing / Muay Thai', category: 'Active' },
  { id: 'k6', title: 'Random Spree', category: 'Experience' },
  { id: 'k7', title: 'Haunted House', category: 'Experience' },
  { id: 'k8', title: 'Fishing', category: 'Outdoors' },
  { id: 'k9', title: 'Camping', category: 'Outdoors' },
  { id: 'k10', title: 'Kites — Pontiac Kite Shop', category: 'Outdoors' },
  { id: 'k11', title: 'Skydiving', category: 'Adventure' },
  { id: 'k12', title: 'Read Robert Greene Books', category: 'Learning' },
  { id: 'k13', title: 'Music Room Session', category: 'Creative' },
  { id: 'k14', title: 'Planetarium', category: 'Culture' },
  { id: 'k15', title: 'Concerts', category: 'Culture' },
  { id: 'k16', title: 'Escape Room', category: 'Experience' },
  { id: 'k17', title: 'Movies', category: 'Experience' },
  { id: 'k18', title: 'Cook New Foods Together', category: 'Creative' },
  { id: 'k19', title: 'Six Flags', category: 'Active' },
  { id: 'k20', title: 'Track Days', category: 'Adventure' },
  { id: 'k21', title: 'Scene75', category: 'Active' },
  { id: 'k22', title: 'Basketball', category: 'Active' },
  { id: 'k23', title: 'Year End Wrap-Up Video', category: 'Legacy' },
  { id: 'k24', title: 'Urban Air', category: 'Active' },
  { id: 'k25', title: "Grady's", category: 'Experience' },
  { id: 'k26', title: 'Rock Climbing', category: 'Active' },
  { id: 'k27', title: 'Arts & Crafts', category: 'Creative' },
  { id: 'k28', title: 'Dave & Busters', category: 'Experience' },
  { id: 'k29', title: 'WNDR Museum', category: 'Culture' },
  { id: 'k30', title: 'Candlelight Concert', category: 'Culture' },
  { id: 'k31', title: 'Funks Grove', category: 'Outdoors' },
  { id: 'k32', title: 'Dawson', category: 'Outdoors' },
  { id: 'k33', title: 'Camlara Park', category: 'Outdoors' },
  { id: 'k34', title: 'Starved Rock', category: 'Outdoors' },
  { id: 'k35', title: 'Parasailing', category: 'Adventure' },
  { id: 'k36', title: 'Hang Gliding', category: 'Adventure' },
  { id: 'k37', title: 'Cliff Dive', category: 'Adventure' },
  { id: 'k38', title: 'Deep Scuba Dive', category: 'Adventure' },
  { id: 'k39', title: 'NASCAR Track Day', category: 'Adventure' },
  { id: 'k40', title: 'Swim with Sharks', category: 'Adventure' },
  { id: 'k41', title: 'Zip Line', category: 'Adventure' },
  { id: 'k42', title: 'Airbnb Getaway', category: 'Travel' },
  { id: 'k43', title: 'Horse Back Riding', category: 'Outdoors' },
  { id: 'k44', title: 'River Rafting', category: 'Adventure' },
  { id: 'k45', title: 'Skating', category: 'Active' },
  { id: 'k46', title: 'Concerts — Drake & Fridayy', category: 'Culture' },
  { id: 'k47', title: 'Night Drive', category: 'Experience' },
  { id: 'k48', title: 'Outdoor Movie / Drive-In', category: 'Culture' },
  { id: 'k49', title: 'Night Fishing', category: 'Outdoors' },
  { id: 'k50', title: 'Magic Show / Illusionist', category: 'Culture' },
  { id: 'k51', title: 'K1 Indoor Karts', category: 'Active' },
  { id: 'k52', title: 'Everest', category: 'Adventure' },
]

const KIDS_CATEGORIES = ['Active', 'Adventure', 'Travel', 'Outdoors', 'Culture', 'Creative', 'Experience', 'Learning', 'Legacy']

const issueFields: FormField[] = [
  { name: 'title', label: 'Issue', type: 'text', required: true },
  { name: 'description', label: 'Details', type: 'textarea' },
  { name: 'category', label: 'Category', type: 'select', options: [
    { value: 'maintenance', label: 'Maintenance' }, { value: 'landlord', label: 'Landlord' },
    { value: 'utility', label: 'Utility' }, { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' },
  ], placeholder: 'Category' },
  { name: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
  ], defaultValue: 'medium' },
]

const contactFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'type', label: 'Relationship', type: 'select', options: [
    { value: 'family', label: 'Family' }, { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' }, { value: 'other', label: 'Other' },
  ], placeholder: 'Select type' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

function Section({ title, icon, count, defaultOpen = false, children }: {
  title: string; icon: React.ReactNode; count?: number; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-surface text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-text-muted">{icon}</span>
          <p className="text-sm font-medium text-text-primary">{title}</p>
          {count !== undefined && (
            <span className="text-[9px] bg-surface-2 border border-border text-text-muted px-1.5 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 bg-surface-2 space-y-3 border-t border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FamilyPage() {
  const { demoData } = useDemoMode()
  const [homeIssues, setHomeIssues] = useState<HomeIssue[]>(demoData.homeIssues)
  const [expandedRel, setExpandedRel] = useState<string | null>(null)
  const [selectedProtection, setSelectedProtection] = useState<typeof PROTECTION_AGENTS[0] | null>(null)
  const [groceryList, setGroceryList] = useState<string[]>(['Rice', 'Chicken', 'Eggs', 'Bread', 'Oat milk'])
  const [newGrocery, setNewGrocery] = useState('')
  const [memories, setMemories] = useState<string[]>([])
  const [memoryNote, setMemoryNote] = useState('')
  const [addModal, setAddModal] = useState<'issue' | 'contact' | null>(null)
  const [doneKids, setDoneKids] = useState<string[]>([])
  const [kidsFilter, setKidsFilter] = useState<string | null>(null)

  const openIssues = homeIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed')
  const filteredKids = kidsFilter ? KIDS_BUCKET_LIST.filter(k => k.category === kidsFilter) : KIDS_BUCKET_LIST

  const getHealthColor = (h: number) => h >= 80 ? 'bg-green-400' : h >= 60 ? 'bg-yellow-400' : 'bg-crisis'
  const getAccessColor = (level: string) => {
    if (level === 'Core Circle') return 'text-accent border-accent/30 bg-accent/10'
    if (level === 'Inner Circle') return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    return 'text-text-muted border-border'
  }

  return (
    <div className="px-4 py-6 space-y-3">
      <div className="mb-2">
        <h1 className="text-text-primary font-serif text-xl">Family</h1>
        <p className="text-text-muted text-xs mt-0.5">The reason for all of it</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-surface border border-border rounded-lg p-2.5 text-center">
          <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Relationships</p>
          <p className="text-sm font-medium text-text-primary">{RELATIONSHIP_AGENTS.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-2.5 text-center">
          <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Kids List</p>
          <p className="text-sm font-medium text-accent">{doneKids.length}/{KIDS_BUCKET_LIST.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-2.5 text-center">
          <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Home Issues</p>
          <p className={clsx('text-sm font-medium', openIssues.length > 0 ? 'text-crisis' : 'text-green-400')}>
            {openIssues.length}
          </p>
        </div>
      </div>

      {/* Relationship Intelligence */}
      <Section title="Relationship Intelligence" icon={<Users size={14} />} count={RELATIONSHIP_AGENTS.length} defaultOpen>
        <button onClick={() => setAddModal('contact')} className="flex items-center gap-1 text-xs text-accent mb-1">
          <Plus size={10} />Add Contact
        </button>
        {RELATIONSHIP_AGENTS.map(rel => (
          <motion.div key={rel.id} layout>
            <button
              className="w-full bg-surface border border-border rounded-xl p-4 text-left"
              onClick={() => setExpandedRel(expandedRel === rel.id ? null : rel.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-text-primary">{rel.name}</p>
                    <span className="text-[10px] text-text-muted uppercase">{rel.type}</span>
                    <span className={clsx('text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider', getAccessColor(rel.accessLevel))}>
                      {rel.accessLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', getHealthColor(rel.health))} style={{ width: `${rel.health}%` }} />
                    </div>
                    <span className="text-[9px] text-text-muted">{rel.health}%</span>
                  </div>
                  <p className="text-[10px] text-text-muted">Last contact: <span className="text-text-secondary">{rel.daysSince}d ago</span></p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0 mt-1" />
              </div>
              <div className="mt-3 p-3 bg-surface-2 rounded-lg border border-border">
                <p className="text-[9px] uppercase tracking-wider text-accent mb-1 flex items-center gap-1">
                  <Zap size={8} />Agent Recommendation
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">{rel.nextAction}</p>
              </div>
            </button>

            <AnimatePresence>
              {expandedRel === rel.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-surface border border-border border-t-0 rounded-b-xl p-4 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Conversation Themes</p>
                      {rel.themes.map((t, i) => (
                        <p key={i} className="text-xs text-text-secondary flex gap-2 mb-1">
                          <span className="text-accent flex-shrink-0">◆</span>{t}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Touch Points</p>
                      {rel.touchPoints.map((tp, i) => (
                        <div key={i} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                          <span className="text-text-secondary">{tp.label}</span>
                          <span className="text-text-muted">{tp.frequency}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">{rel.notes}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </Section>

      {/* Legacy Protection */}
      <Section title="Legacy Protection" icon={<Shield size={14} />} count={4}>
        <p className="text-xs text-text-muted mb-2">AI agents managing your protection infrastructure — for them, not just for you.</p>
        <div className="grid grid-cols-2 gap-2">
          {PROTECTION_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedProtection(agent)}
              className="bg-surface border border-[#1c1c1c] rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors relative"
            >
              {agent.pulse && <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              <p className="text-sm font-medium" style={{ color: agent.color }}>{agent.code}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{agent.dept}</p>
              <p className="text-[10px] text-text-muted mt-2 leading-relaxed line-clamp-2">{agent.status}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Kids Bucket List */}
      <Section title="Kids Bucket List" icon={<Heart size={14} />} count={KIDS_BUCKET_LIST.length}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-text-muted">{doneKids.length} done</p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
          <button
            onClick={() => setKidsFilter(null)}
            className={clsx('flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider border transition-all',
              !kidsFilter ? 'border-accent/50 text-accent bg-accent/10' : 'border-border text-text-muted')}
          >All</button>
          {KIDS_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setKidsFilter(kidsFilter === cat ? null : cat)}
              className={clsx('flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider border transition-all',
                kidsFilter === cat ? 'border-accent/50 text-accent bg-accent/10' : 'border-border text-text-muted')}
            >{cat}</button>
          ))}
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
          {filteredKids.map(item => (
            <button
              key={item.id}
              onClick={() => setDoneKids(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}
              className={clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
                doneKids.includes(item.id) ? 'border-accent/20 bg-accent/5' : 'border-border bg-surface')}
            >
              {doneKids.includes(item.id)
                ? <CheckSquare size={13} className="text-accent flex-shrink-0" />
                : <Square size={13} className="text-text-muted flex-shrink-0" />
              }
              <p className={clsx('text-sm flex-1', doneKids.includes(item.id) ? 'text-text-muted line-through' : 'text-text-primary')}>
                {item.title}
              </p>
              <span className="text-[9px] text-text-muted flex-shrink-0">{item.category}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Home */}
      <Section title="Home Issues" icon={<Home size={14} />} count={openIssues.length}>
        <button onClick={() => setAddModal('issue')} className="flex items-center gap-1 text-xs text-accent mb-1">
          <Plus size={10} />Add Issue
        </button>
        {homeIssues.map(issue => (
          <Card key={issue.id} variant={issue.priority === 'critical' || issue.priority === 'high' ? 'threat' : 'default'} className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-primary font-medium">{issue.title}</p>
                {issue.description && <p className="text-xs text-text-secondary mt-1">{issue.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  {issue.category && <span className="text-[10px] uppercase text-text-muted">{issue.category}</span>}
                  <StatusBadge status={issue.priority} />
                </div>
              </div>
              <StatusBadge status={issue.status} />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">Reported: {formatDate(issue.reported_date)}</p>
          </Card>
        ))}
      </Section>

      {/* Moments */}
      <Section title="Moments & Notes" icon={<Heart size={14} />}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Grocery List</p>
          <div className="space-y-1.5 mb-2">
            {groceryList.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{item}</span>
                <button onClick={() => setGroceryList(prev => prev.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-crisis text-xs">✕</button>
              </div>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (newGrocery.trim()) { setGroceryList(prev => [...prev, newGrocery.trim()]); setNewGrocery('') } }} className="flex gap-2">
            <input value={newGrocery} onChange={e => setNewGrocery(e.target.value)} placeholder="Add item..." className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors" />
            <button type="submit" className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs">Add</button>
          </form>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Family Moments</p>
          <div className="space-y-1.5 mb-2">
            {memories.map((m, i) => <p key={i} className="text-xs text-text-secondary border-l-2 border-accent/30 pl-2">{m}</p>)}
            {memories.length === 0 && <p className="text-xs text-text-muted italic">Capture a family moment.</p>}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (memoryNote.trim()) { setMemories(prev => [...prev, memoryNote.trim()]); setMemoryNote('') } }} className="flex gap-2">
            <input value={memoryNote} onChange={e => setMemoryNote(e.target.value)} placeholder="Write a moment..." className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors" />
            <button type="submit" className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs">Save</button>
          </form>
        </div>
      </Section>

      {/* Protection Agent Modal */}
      <Modal isOpen={!!selectedProtection} onClose={() => setSelectedProtection(null)} title={selectedProtection ? `${selectedProtection.code} — ${selectedProtection.dept}` : ''}>
        {selectedProtection && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield size={24} style={{ color: selectedProtection.color }} />
              <div>
                <p className="text-lg font-medium" style={{ color: selectedProtection.color }}>{selectedProtection.code}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{selectedProtection.dept}</p>
              </div>
              <span className={clsx('ml-auto w-2 h-2 rounded-full', selectedProtection.pulse ? 'bg-green-400 animate-pulse' : 'bg-[#3a3a3a]')} />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{selectedProtection.detail}</p>
            <div className="bg-surface-2 rounded-lg p-3 border border-accent/20">
              <p className="text-[9px] uppercase tracking-wider text-accent mb-1">Priority</p>
              <p className="text-xs text-text-primary font-medium">{selectedProtection.priority}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={addModal === 'issue'} onClose={() => setAddModal(null)} title="Add Home Issue">
        <QuickAddForm
          fields={issueFields}
          onSubmit={data => {
            setHomeIssues(prev => [...prev, { id: `issue-${Date.now()}`, user_id: 'demo', title: String(data.title), description: data.description ? String(data.description) : null, category: (data.category as 'maintenance') || null, priority: (data.priority as 'high') || 'medium', status: 'open', reported_date: new Date().toISOString().split('T')[0], resolved_date: null, note: null, created_at: new Date().toISOString() }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Issue"
        />
      </Modal>

      <Modal isOpen={addModal === 'contact'} onClose={() => setAddModal(null)} title="Add Contact">
        <QuickAddForm fields={contactFields} onSubmit={() => setAddModal(null)} onCancel={() => setAddModal(null)} submitLabel="Add Contact" />
      </Modal>
    </div>
  )
}
