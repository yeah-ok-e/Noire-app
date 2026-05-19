'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'

const appFields: FormField[] = [
  { name: 'company', label: 'Company', type: 'text', placeholder: 'Company name', required: true },
  { name: 'role', label: 'Role', type: 'text', placeholder: 'Job title', required: true },
  { name: 'applied_date', label: 'Applied Date', type: 'date' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'applied', label: 'Applied' }, { value: 'screening', label: 'Screening' },
      { value: 'interview', label: 'Interview' }, { value: 'offer', label: 'Offer' },
      { value: 'follow-up', label: 'Follow-up' },
    ],
    defaultValue: 'applied',
  },
  { name: 'salary_range', label: 'Salary Range', type: 'text', placeholder: 'e.g. $45k–$55k' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Notes...' },
]

const incomeFields: FormField[] = [
  { name: 'name', label: 'Source Name', type: 'text', placeholder: 'e.g. Freelance Design', required: true },
  {
    name: 'type', label: 'Type', type: 'select',
    options: [
      { value: 'employment', label: 'Employment' }, { value: 'freelance', label: 'Freelance' },
      { value: 'unemployment', label: 'Unemployment' }, { value: 'noire', label: 'Noire' },
      { value: 'side', label: 'Side Hustle' }, { value: 'assistance', label: 'Assistance' },
      { value: 'other', label: 'Other' },
    ],
    placeholder: 'Select type',
  },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0' },
  {
    name: 'frequency', label: 'Frequency', type: 'select',
    options: [
      { value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Biweekly' },
      { value: 'monthly', label: 'Monthly' }, { value: 'one-time', label: 'One-time' },
      { value: 'irregular', label: 'Irregular' },
    ],
    placeholder: 'Select frequency',
  },
  { name: 'expected_date', label: 'Expected Date', type: 'date' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Details...' },
]

const assistanceFields: FormField[] = [
  { name: 'program_name', label: 'Program Name', type: 'text', placeholder: 'e.g. LIHEAP', required: true },
  {
    name: 'type', label: 'Type', type: 'select',
    options: [
      { value: 'housing', label: 'Housing' }, { value: 'utilities', label: 'Utilities' },
      { value: 'food', label: 'Food' }, { value: 'medical', label: 'Medical' },
      { value: 'unemployment', label: 'Unemployment' }, { value: 'other', label: 'Other' },
    ],
    placeholder: 'Select type',
  },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'researching', label: 'Researching' }, { value: 'applied', label: 'Applied' },
      { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' },
    ],
    defaultValue: 'researching',
  },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: 'Expected amount' },
  { name: 'appointment_date', label: 'Appointment Date', type: 'date' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Details, documents needed...' },
]

export default function IncomePage() {
  const { demoData } = useDemoMode()
  const [addModal, setAddModal] = useState<'application' | 'income' | 'assistance' | null>(null)
  const [applications, setApplications] = useState([] as Array<{
    id: string; company: string; role: string; status: string;
    applied_date?: string; salary_range?: string; note?: string
  }>)
  const [incomeSources, setIncomeSources] = useState(demoData.incomeSources)
  const [assistancePrograms, setAssistancePrograms] = useState(demoData.assistancePrograms)

  const totalExpected = incomeSources
    .filter(i => i.status === 'active' && i.amount)
    .reduce((s, i) => s + (i.amount || 0), 0)

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-text-primary font-serif text-xl">Income</h1>
        <p className="text-text-muted text-xs mt-0.5">Revenue, Applications & Assistance</p>
      </div>

      {/* Income Overview */}
      <div className="grid grid-cols-2 gap-2">
        <Card variant="default" className="p-3">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">Expected</p>
          <p className="text-lg font-medium text-accent mt-1">{formatCurrency(totalExpected)}/mo</p>
        </Card>
        <Card variant="default" className="p-3">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">Applications</p>
          <p className="text-lg font-medium text-text-primary mt-1">{applications.length}</p>
        </Card>
      </div>

      {/* Income Sources */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Income Sources</p>
          <button onClick={() => setAddModal('income')} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <Plus size={12} />Add
          </button>
        </div>
        <div className="space-y-2">
          {incomeSources.map(source => (
            <Card key={source.id} variant={source.type === 'unemployment' ? 'opportunity' : 'default'} className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{source.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase text-text-muted">{source.type}</span>
                    <span className="text-[10px] text-text-muted">{source.frequency}</span>
                    <StatusBadge status={source.status} />
                  </div>
                  {source.expected_date && (
                    <p className="text-xs text-accent mt-1">Expected: {formatDate(source.expected_date)}</p>
                  )}
                  {source.note && <p className="text-xs text-text-muted mt-1">{source.note}</p>}
                </div>
                {source.amount && (
                  <p className="text-text-primary font-medium">{formatCurrency(source.amount)}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Job Applications */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Job Applications</p>
          <button onClick={() => setAddModal('application')} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <Plus size={12} />Add
          </button>
        </div>
        {applications.length === 0 ? (
          <Card variant="glass" className="p-4 text-center">
            <p className="text-text-muted text-sm">No applications tracked yet.</p>
            <button
              onClick={() => setAddModal('application')}
              className="mt-2 text-accent text-xs hover:underline"
            >
              Add first application
            </button>
          </Card>
        ) : (
          <div className="space-y-2">
            {applications.map(app => (
              <Card key={app.id} variant="default" className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-primary font-medium">{app.company}</p>
                    <p className="text-xs text-text-secondary">{app.role}</p>
                    {app.salary_range && <p className="text-xs text-accent mt-0.5">{app.salary_range}</p>}
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Assistance Programs */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Assistance Programs</p>
          <button onClick={() => setAddModal('assistance')} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <Plus size={12} />Add
          </button>
        </div>
        <div className="space-y-2">
          {assistancePrograms.map(prog => (
            <Card key={prog.id} variant="opportunity" className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{prog.program_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase text-text-muted">{prog.type}</span>
                    <StatusBadge status={prog.status} />
                  </div>
                  {prog.appointment_date && (
                    <p className="text-xs text-accent mt-1">Appt: {formatDate(prog.appointment_date)}</p>
                  )}
                  {prog.note && <p className="text-xs text-text-muted mt-1">{prog.note}</p>}
                </div>
                {prog.amount && (
                  <p className="text-accent font-medium">{formatCurrency(prog.amount)}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={addModal === 'application'} onClose={() => setAddModal(null)} title="Add Job Application">
        <QuickAddForm
          fields={appFields}
          onSubmit={data => {
            setApplications(prev => [...prev, {
              id: `app-${Date.now()}`,
              company: String(data.company),
              role: String(data.role),
              status: String(data.status || 'applied'),
              applied_date: data.applied_date ? String(data.applied_date) : undefined,
              salary_range: data.salary_range ? String(data.salary_range) : undefined,
              note: data.note ? String(data.note) : undefined,
            }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Track Application"
        />
      </Modal>

      <Modal isOpen={addModal === 'income'} onClose={() => setAddModal(null)} title="Add Income Source">
        <QuickAddForm
          fields={incomeFields}
          onSubmit={data => {
            setIncomeSources(prev => [...prev, {
              id: `inc-${Date.now()}`,
              user_id: 'demo',
              name: String(data.name),
              type: (data.type as 'employment') || null,
              amount: data.amount ? Number(data.amount) : null,
              frequency: (data.frequency as 'monthly') || null,
              status: 'active',
              expected_date: data.expected_date ? String(data.expected_date) : null,
              note: data.note ? String(data.note) : null,
              created_at: new Date().toISOString(),
            }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Source"
        />
      </Modal>

      <Modal isOpen={addModal === 'assistance'} onClose={() => setAddModal(null)} title="Add Assistance Program">
        <QuickAddForm
          fields={assistanceFields}
          onSubmit={data => {
            setAssistancePrograms(prev => [...prev, {
              id: `assist-${Date.now()}`,
              user_id: 'demo',
              program_name: String(data.program_name),
              type: (data.type as 'housing') || null,
              status: (data.status as 'researching') || 'researching',
              amount: data.amount ? Number(data.amount) : null,
              appointment_date: data.appointment_date ? String(data.appointment_date) : null,
              contact_name: null,
              contact_phone: null,
              note: data.note ? String(data.note) : null,
              created_at: new Date().toISOString(),
            }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Program"
        />
      </Modal>
    </div>
  )
}
