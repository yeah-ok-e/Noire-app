'use client'

import { useState } from 'react'
import { Plus, Home, Users, Heart, Zap } from 'lucide-react'
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
    health: 85, daysSince: 3, emoji: '♥',
    nextAction: 'Sunday call — be present, not performative. She covered your phone. Don\'t let the debt create distance.',
    themes: ['Family news', 'Your progress — give her a real update', 'Honoring what she did'],
    touchPoints: [
      { label: 'Sunday call', frequency: 'Weekly' },
      { label: 'Share a win — no matter how small', frequency: 'Ongoing' },
    ],
    notes: 'Covered phone bill — $60 owed. Emergency contact. Core support.',
    sharedWith: ['Your journey', 'Family'],
  },
  {
    id: 'rel-2', name: 'Dana', type: 'Friend', accessLevel: 'Inner Circle',
    health: 70, daysSince: 7, emoji: '◆',
    nextAction: 'Send a check-in text. Keep the energy warm while the debt is pending. Don\'t let silence become the default.',
    themes: ['Life updates', 'What you\'re building', 'Shared history'],
    touchPoints: [
      { label: 'Text check-in', frequency: 'Biweekly' },
      { label: 'In-person catch-up', frequency: 'Monthly' },
    ],
    notes: 'Personal loan — $100 owed. Trusted friend. Genuine support.',
    sharedWith: ['Support', 'History'],
  },
  {
    id: 'rel-3', name: 'Reggie', type: 'Friend', accessLevel: 'Inner Circle',
    health: 68, daysSince: 10, emoji: '◆',
    nextAction: 'Keep it real and direct. "I got you" goes a long way. Don\'t let silence become distance.',
    themes: ['The move you\'re making', 'Real talk', 'Shared vision'],
    touchPoints: [
      { label: 'Real conversation', frequency: 'Monthly' },
      { label: 'Share a win when it happens', frequency: 'As available' },
    ],
    notes: 'Personal loan — $100 owed. Real one. Values authenticity.',
    sharedWith: ['Hustle', 'Authenticity'],
  },
]

const LIFE_EVENTS = [
  'First Noire pop-up — bring family as VIPs. They should feel the world you\'re building.',
  'First big month — celebrate together. Let them witness the turn.',
  'A weekend trip together. Shared experience creates shared memory.',
  'Introduce them to your network when the time is right.',
  'Legacy conversation — what do they want to be remembered for?',
]

const SUGGESTED_EXPERIENCES = [
  { label: 'Family dinner — recurring', note: 'The table is the foundation of everything.' },
  { label: 'Weekend trip', note: 'Even a short one. Shared experiences matter.' },
  { label: 'Noire exclusive event — family invited', note: 'Show them the brand world you\'re building.' },
  { label: 'Sunday tradition', note: 'Calls, meals, something consistent. Build the rhythm.' },
]

const issueFields: FormField[] = [
  { name: 'title', label: 'Issue', type: 'text', placeholder: 'Brief description', required: true },
  { name: 'description', label: 'Details', type: 'textarea', placeholder: 'Full description...' },
  { name: 'category', label: 'Category', type: 'select', options: [
    { value: 'maintenance', label: 'Maintenance' }, { value: 'landlord', label: 'Landlord' },
    { value: 'utility', label: 'Utility' }, { value: 'safety', label: 'Safety' },
    { value: 'appliance', label: 'Appliance' }, { value: 'lease', label: 'Lease' },
    { value: 'other', label: 'Other' },
  ], placeholder: 'Category' },
  { name: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
  ], defaultValue: 'medium' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Additional context...' },
]

const contactFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'type', label: 'Relationship', type: 'select', options: [
    { value: 'family', label: 'Family' }, { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' }, { value: 'contact', label: 'Contact' },
    { value: 'other', label: 'Other' },
  ], placeholder: 'Select type' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export default function FamilyPage() {
  const { demoData } = useDemoMode()
  const [homeIssues, setHomeIssues] = useState<HomeIssue[]>(demoData.homeIssues)
  const [expandedRel, setExpandedRel] = useState<string | null>(null)
  const [groceryList, setGroceryList] = useState<string[]>(['Rice', 'Chicken', 'Eggs', 'Bread', 'Oat milk'])
  const [newGrocery, setNewGrocery] = useState('')
  const [memories, setMemories] = useState<string[]>([])
  const [memoryNote, setMemoryNote] = useState('')
  const [addModal, setAddModal] = useState<'issue' | 'contact' | null>(null)
  const [activeTab, setActiveTab] = useState<'relationships' | 'home' | 'moments'>('relationships')

  const openIssues = homeIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed')

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-green-400'
    if (health >= 60) return 'bg-yellow-400'
    return 'bg-crisis'
  }

  const getAccessColor = (level: string) => {
    if (level === 'Core Circle') return 'text-accent border-accent/30 bg-accent/10'
    if (level === 'Inner Circle') return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    return 'text-text-muted border-border'
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-text-primary font-serif text-xl">Family</h1>
        <p className="text-text-muted text-xs mt-0.5">The reason for all of it</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
        {(['relationships', 'home', 'moments'] as const).map(tab => (
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

      {/* Relationships — AI Agent Board */}
      {activeTab === 'relationships' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1.5">
              <Users size={10} />Relationship Intelligence
            </p>
            <button onClick={() => setAddModal('contact')} className="flex items-center gap-1 text-xs text-accent">
              <Plus size={10} />Add
            </button>
          </div>

          {RELATIONSHIP_AGENTS.map(rel => (
            <motion.div key={rel.id} layout>
              <button
                className="w-full bg-surface border border-border rounded-xl p-4 text-left hover:border-border transition-colors"
                onClick={() => setExpandedRel(expandedRel === rel.id ? null : rel.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary">{rel.name}</p>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">{rel.type}</span>
                      <span className={clsx('text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider', getAccessColor(rel.accessLevel))}>
                        {rel.accessLevel}
                      </span>
                    </div>
                    {/* Health bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all', getHealthColor(rel.health))}
                          style={{ width: `${rel.health}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-text-muted">{rel.health}%</span>
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Last interaction: <span className="text-text-secondary">{rel.daysSince}d ago</span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                </div>

                {/* Agent next action */}
                <div className="mt-3 p-3 bg-surface-2 rounded-lg border border-border">
                  <p className="text-[9px] uppercase tracking-wider text-accent mb-1 flex items-center gap-1">
                    <Zap size={8} />Agent Recommendation
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed">{rel.nextAction}</p>
                </div>
              </button>

              {/* Expanded Detail */}
              <AnimatePresence>
                {expandedRel === rel.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-surface-2 border border-border border-t-0 rounded-b-xl p-4 space-y-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Conversation Themes</p>
                        <div className="space-y-1">
                          {rel.themes.map((theme, i) => (
                            <p key={i} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-accent flex-shrink-0 mt-0.5">◆</span>{theme}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Recurring Touch Points</p>
                        {rel.touchPoints.map((tp, i) => (
                          <div key={i} className="flex justify-between text-xs py-1.5 border-b border-border last:border-0">
                            <span className="text-text-secondary">{tp.label}</span>
                            <span className="text-text-muted">{tp.frequency}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Agent Notes</p>
                        <p className="text-xs text-text-muted">{rel.notes}</p>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-all">
                          Log Interaction
                        </button>
                        <button className="flex-1 py-2 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-all">
                          See History
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Life Events to Share */}
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3 flex items-center gap-1.5">
              <Heart size={10} />Life Events to Share
            </p>
            <div className="space-y-2">
              {LIFE_EVENTS.map((event, i) => (
                <div key={i} className="px-4 py-3 bg-surface border border-border rounded-lg text-xs text-text-muted flex items-start gap-2.5">
                  <span className="text-accent flex-shrink-0 mt-0.5">◆</span>
                  {event}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Experiences */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Suggested Experiences</p>
            <div className="space-y-2">
              {SUGGESTED_EXPERIENCES.map((exp, i) => (
                <div key={i} className="p-4 bg-surface border border-border rounded-lg">
                  <p className="text-sm text-text-primary">{exp.label}</p>
                  <p className="text-xs text-text-muted mt-1">{exp.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Home Tab */}
      {activeTab === 'home' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1.5">
              <Home size={10} />Home Issues
              {openIssues.length > 0 && (
                <span className="bg-crisis/20 text-crisis text-[9px] px-1.5 py-0.5 rounded-full">{openIssues.length}</span>
              )}
            </p>
            <button onClick={() => setAddModal('issue')} className="flex items-center gap-1 text-xs text-accent">
              <Plus size={10} />Add
            </button>
          </div>
          {homeIssues.map(issue => (
            <Card key={issue.id} variant={issue.priority === 'critical' || issue.priority === 'high' ? 'threat' : 'default'} className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{issue.title}</p>
                  {issue.description && <p className="text-xs text-text-secondary mt-1 leading-relaxed">{issue.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    {issue.category && <span className="text-[10px] uppercase text-text-muted">{issue.category}</span>}
                    <StatusBadge status={issue.priority} />
                  </div>
                </div>
                <StatusBadge status={issue.status} />
              </div>
              <p className="text-[10px] text-text-muted mt-2">Reported: {formatDate(issue.reported_date)}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Moments Tab */}
      {activeTab === 'moments' && (
        <div className="space-y-4">
          {/* Grocery */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Grocery List</p>
            <Card variant="default" className="p-3">
              <div className="space-y-1.5 mb-3">
                {groceryList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{item}</span>
                    <button onClick={() => setGroceryList(prev => prev.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-crisis text-xs transition-colors">✕</button>
                  </div>
                ))}
              </div>
              <form onSubmit={e => { e.preventDefault(); if (newGrocery.trim()) { setGroceryList(prev => [...prev, newGrocery.trim()]); setNewGrocery('') } }} className="flex gap-2">
                <input value={newGrocery} onChange={e => setNewGrocery(e.target.value)} placeholder="Add item..." className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors" />
                <button type="submit" className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs">Add</button>
              </form>
            </Card>
          </div>

          {/* Family Moments */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Family Moments</p>
            <Card variant="default" className="p-3">
              <div className="space-y-2 mb-3">
                {memories.map((m, i) => <p key={i} className="text-xs text-text-secondary border-l-2 border-accent/30 pl-2">{m}</p>)}
                {memories.length === 0 && <p className="text-xs text-text-muted italic">Capture a family moment.</p>}
              </div>
              <form onSubmit={e => { e.preventDefault(); if (memoryNote.trim()) { setMemories(prev => [...prev, memoryNote.trim()]); setMemoryNote('') } }} className="flex gap-2">
                <input value={memoryNote} onChange={e => setMemoryNote(e.target.value)} placeholder="Write a moment..." className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors" />
                <button type="submit" className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs">Save</button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={addModal === 'issue'} onClose={() => setAddModal(null)} title="Add Home Issue">
        <QuickAddForm
          fields={issueFields}
          onSubmit={data => {
            setHomeIssues(prev => [...prev, { id: `issue-${Date.now()}`, user_id: 'demo', title: String(data.title), description: data.description ? String(data.description) : null, category: (data.category as 'maintenance') || null, priority: (data.priority as 'high') || 'medium', status: 'open', reported_date: new Date().toISOString().split('T')[0], resolved_date: null, note: data.note ? String(data.note) : null, created_at: new Date().toISOString() }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Issue"
        />
      </Modal>

      <Modal isOpen={addModal === 'contact'} onClose={() => setAddModal(null)} title="Add Contact">
        <QuickAddForm
          fields={contactFields}
          onSubmit={() => setAddModal(null)}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Contact"
        />
      </Modal>
    </div>
  )
}
