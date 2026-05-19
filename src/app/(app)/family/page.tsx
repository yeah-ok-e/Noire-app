'use client'

import { useState } from 'react'
import { Plus, Home, User, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'
import type { HomeIssue, Relationship } from '@/types/database'

const issueFields: FormField[] = [
  { name: 'title', label: 'Issue', type: 'text', placeholder: 'Brief description', required: true },
  { name: 'description', label: 'Details', type: 'textarea', placeholder: 'Full description...' },
  {
    name: 'category', label: 'Category', type: 'select',
    options: [
      { value: 'maintenance', label: 'Maintenance' }, { value: 'landlord', label: 'Landlord' },
      { value: 'utility', label: 'Utility' }, { value: 'safety', label: 'Safety' },
      { value: 'appliance', label: 'Appliance' }, { value: 'lease', label: 'Lease' },
      { value: 'other', label: 'Other' },
    ],
    placeholder: 'Category',
  },
  {
    name: 'priority', label: 'Priority', type: 'select',
    options: [
      { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
    ],
    defaultValue: 'medium',
  },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Additional context...' },
]

const relationshipFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  {
    name: 'type', label: 'Relationship', type: 'select',
    options: [
      { value: 'family', label: 'Family' }, { value: 'friend', label: 'Friend' },
      { value: 'colleague', label: 'Colleague' }, { value: 'creditor', label: 'Creditor' },
      { value: 'landlord', label: 'Landlord' }, { value: 'contact', label: 'Contact' },
      { value: 'child', label: 'Child' }, { value: 'partner', label: 'Partner' },
      { value: 'other', label: 'Other' },
    ],
    placeholder: 'Select type',
  },
  { name: 'phone', label: 'Phone', type: 'text', placeholder: 'Phone number' },
  { name: 'email', label: 'Email', type: 'text', placeholder: 'Email address' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any notes...' },
  { name: 'is_emergency_contact', label: 'Emergency Contact', type: 'checkbox' },
]

const DEMO_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-1', user_id: 'demo', name: 'Mary',
    type: 'family', contact_info: { phone: '—' },
    notes: 'Covered phone bill — owed $60', is_emergency_contact: true, created_at: new Date().toISOString(),
  },
  {
    id: 'rel-2', user_id: 'demo', name: 'Dana',
    type: 'friend', contact_info: {},
    notes: 'Personal loan — $100 owed', is_emergency_contact: false, created_at: new Date().toISOString(),
  },
  {
    id: 'rel-3', user_id: 'demo', name: 'Reggie',
    type: 'friend', contact_info: {},
    notes: 'Personal loan — $100 owed', is_emergency_contact: false, created_at: new Date().toISOString(),
  },
]

export default function FamilyPage() {
  const { demoData } = useDemoMode()
  const [homeIssues, setHomeIssues] = useState<HomeIssue[]>(demoData.homeIssues)
  const [relationships, setRelationships] = useState<Relationship[]>(DEMO_RELATIONSHIPS)
  const [groceryList, setGroceryList] = useState<string[]>(['Rice', 'Chicken', 'Eggs', 'Bread', 'Oat milk'])
  const [newGrocery, setNewGrocery] = useState('')
  const [addModal, setAddModal] = useState<'issue' | 'contact' | null>(null)
  const [memoryNote, setMemoryNote] = useState('')
  const [memories, setMemories] = useState<string[]>([])

  const openIssues = homeIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed')

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-text-primary font-serif text-xl">Family & Home</h1>
        <p className="text-text-muted text-xs mt-0.5">Household Command</p>
      </div>

      {/* Home Issues */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <Home size={10} />
            Home Issues
            {openIssues.length > 0 && (
              <span className="bg-crisis/20 text-crisis text-[9px] px-1.5 py-0.5 rounded-full ml-1">
                {openIssues.length}
              </span>
            )}
          </p>
          <button onClick={() => setAddModal('issue')} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <Plus size={12} />Add
          </button>
        </div>
        <div className="space-y-2">
          {homeIssues.map(issue => (
            <Card
              key={issue.id}
              variant={issue.priority === 'critical' || issue.priority === 'high' ? 'threat' : 'default'}
              className="p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{issue.title}</p>
                  {issue.description && (
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{issue.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {issue.category && <span className="text-[10px] uppercase text-text-muted">{issue.category}</span>}
                    <StatusBadge status={issue.priority} />
                  </div>
                  {issue.note && <p className="text-xs text-text-muted mt-1">{issue.note}</p>}
                </div>
                <StatusBadge status={issue.status} />
              </div>
              <p className="text-[10px] text-text-muted mt-2">Reported: {formatDate(issue.reported_date)}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Relationships Vault */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <User size={10} />
            Relationships
          </p>
          <button onClick={() => setAddModal('contact')} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <Plus size={12} />Add
          </button>
        </div>
        <div className="space-y-2">
          {relationships.map(rel => (
            <Card key={rel.id} variant="default" className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-primary font-medium">{rel.name}</p>
                    {rel.is_emergency_contact && (
                      <span className="text-[9px] bg-crisis/15 text-crisis border border-crisis/30 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Emergency
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase text-text-muted mt-0.5 block">{rel.type}</span>
                  {rel.notes && <p className="text-xs text-text-muted mt-1">{rel.notes}</p>}
                </div>
                {rel.contact_info?.phone && (
                  <p className="text-xs text-text-secondary">{rel.contact_info.phone}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Grocery / Food Notes */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Grocery List</p>
        <Card variant="default" className="p-3">
          <div className="space-y-1.5 mb-3">
            {groceryList.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{item}</span>
                <button
                  onClick={() => setGroceryList(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-text-muted hover:text-crisis transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={e => {
              e.preventDefault()
              if (newGrocery.trim()) {
                setGroceryList(prev => [...prev, newGrocery.trim()])
                setNewGrocery('')
              }
            }}
            className="flex gap-2"
          >
            <input
              value={newGrocery}
              onChange={e => setNewGrocery(e.target.value)}
              placeholder="Add item..."
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs"
            >
              Add
            </button>
          </form>
        </Card>
      </div>

      {/* Memory Notes */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Family Moments</p>
        <Card variant="default" className="p-3">
          <div className="space-y-2 mb-3">
            {memories.map((m, i) => (
              <p key={i} className="text-xs text-text-secondary border-l-2 border-accent/30 pl-2">{m}</p>
            ))}
            {memories.length === 0 && (
              <p className="text-xs text-text-muted italic">Capture a family moment or note.</p>
            )}
          </div>
          <form
            onSubmit={e => {
              e.preventDefault()
              if (memoryNote.trim()) {
                setMemories(prev => [...prev, memoryNote.trim()])
                setMemoryNote('')
              }
            }}
            className="flex gap-2"
          >
            <input
              value={memoryNote}
              onChange={e => setMemoryNote(e.target.value)}
              placeholder="Write a moment..."
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs"
            >
              Save
            </button>
          </form>
        </Card>
      </div>

      {/* Modals */}
      <Modal isOpen={addModal === 'issue'} onClose={() => setAddModal(null)} title="Add Home Issue">
        <QuickAddForm
          fields={issueFields}
          onSubmit={data => {
            setHomeIssues(prev => [...prev, {
              id: `issue-${Date.now()}`,
              user_id: 'demo',
              title: String(data.title),
              description: data.description ? String(data.description) : null,
              category: (data.category as 'maintenance') || null,
              priority: (data.priority as 'high') || 'medium',
              status: 'open',
              reported_date: new Date().toISOString().split('T')[0],
              resolved_date: null,
              note: data.note ? String(data.note) : null,
              created_at: new Date().toISOString(),
            }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Issue"
        />
      </Modal>

      <Modal isOpen={addModal === 'contact'} onClose={() => setAddModal(null)} title="Add Contact">
        <QuickAddForm
          fields={relationshipFields}
          onSubmit={data => {
            setRelationships(prev => [...prev, {
              id: `rel-${Date.now()}`,
              user_id: 'demo',
              name: String(data.name),
              type: (data.type as 'family') || null,
              contact_info: {
                phone: data.phone ? String(data.phone) : '',
                email: data.email ? String(data.email) : '',
              },
              notes: data.notes ? String(data.notes) : null,
              is_emergency_contact: Boolean(data.is_emergency_contact),
              created_at: new Date().toISOString(),
            }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Contact"
        />
      </Modal>
    </div>
  )
}
