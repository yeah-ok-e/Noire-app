'use client'
import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { FormField } from '@/types/app'

const now = new Date()

const DEMO_EVENTS = [
  { id: 'e1', title: 'LIHEAP Appointment', start_at: addDays(now, 2).toISOString(), category: 'assistance', priority: 'critical' },
  { id: 'e2', title: 'Certify Unemployment (PA UC)', start_at: addDays(now, 2).toISOString(), category: 'income', priority: 'critical' },
  { id: 'e3', title: 'Expected UC Deposit', start_at: addDays(now, 4).toISOString(), category: 'income', priority: 'high' },
  { id: 'e4', title: 'Follow up — Keisha Events (Noire)', start_at: addDays(now, 3).toISOString(), category: 'noire', priority: 'high' },
  { id: 'e5', title: 'Township assistance follow-up', start_at: addDays(now, 5).toISOString(), category: 'assistance', priority: 'medium' },
]

const EVENT_FIELDS: FormField[] = [
  { name: 'title', label: 'Event Title', type: 'text', required: true },
  { name: 'start_at', label: 'Date & Time', type: 'date', required: true },
  { name: 'category', label: 'Category', type: 'select', options: [
    { value: 'income', label: 'Income' }, { value: 'assistance', label: 'Assistance' },
    { value: 'noire', label: 'Noire' }, { value: 'family', label: 'Family' },
    { value: 'health', label: 'Health' }, { value: 'other', label: 'Other' },
  ]},
  { name: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
  ]},
  { name: 'description', label: 'Notes', type: 'textarea' },
]

const CATEGORY_COLORS: Record<string, string> = {
  income: 'bg-[#d4af7a]/20 border-[#d4af7a]/30',
  assistance: 'bg-green-500/10 border-green-500/20',
  noire: 'bg-[#888]/10 border-[#888]/20',
  family: 'bg-blue-500/10 border-blue-500/20',
  health: 'bg-purple-500/10 border-purple-500/20',
  other: 'bg-[#1a1a1a] border-[#2a2a2a]',
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(startOfWeek(now, { weekStartsOn: 1 }))
  const [events, setEvents] = useState(DEMO_EVENTS)
  const [addModal, setAddModal] = useState(false)
  const [view, setView] = useState<'week' | 'list'>('list')

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const upcoming = [...events].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-[10px] uppercase tracking-widest text-[#444]">
          {format(now, 'MMMM yyyy')}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex border border-[#222] rounded-lg overflow-hidden">
            {(['list', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs transition-colors ${view === v ? 'bg-[#1a1a1a] text-[#d4af7a]' : 'text-[#444]'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setAddModal(true)} className="flex items-center gap-1 text-[10px] text-[#d4af7a]">
            <Plus size={12} />Add
          </button>
        </div>
      </div>

      {view === 'week' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <button onClick={() => setWeekStart(d => addDays(d, -7))} className="p-1.5 text-[#444] hover:text-[#f0ede8]">
              <ChevronLeft size={16} />
            </button>
            <p className="text-xs text-[#888]">
              {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d')}
            </p>
            <button onClick={() => setWeekStart(d => addDays(d, 7))} className="p-1.5 text-[#444] hover:text-[#f0ede8]">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => {
              const dayEvents = events.filter(e => isSameDay(parseISO(e.start_at), day))
              const isToday = isSameDay(day, now)
              return (
                <div key={day.toISOString()} className={`rounded-lg p-2 min-h-[60px] ${isToday ? 'bg-[#1a1a1a] border border-[#d4af7a]/30' : 'bg-[#0d0d0d]'}`}>
                  <p className={`text-[9px] text-center mb-1 ${isToday ? 'text-[#d4af7a]' : 'text-[#444]'}`}>
                    {format(day, 'EEE')}<br />{format(day, 'd')}
                  </p>
                  {dayEvents.map(e => (
                    <div key={e.id} className="w-full h-1.5 rounded-full bg-[#d4af7a] mb-1 opacity-70" />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#444] mb-3">Upcoming</p>
        <div className="space-y-2">
          {upcoming.slice(0, 8).map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#f0ede8] font-medium">{event.title}</p>
                  <p className="text-[10px] text-[#888] mt-1">
                    {format(parseISO(event.start_at), 'EEE, MMM d')}
                  </p>
                </div>
                <StatusBadge status={event.priority} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recurring */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#444] mb-3">Recurring</p>
        <div className="space-y-1.5">
          {[
            { label: 'PA UC Certification', frequency: 'Biweekly (Tuesdays)' },
            { label: 'SNAP Recertification', frequency: 'Monthly' },
            { label: 'Noire Instagram Post', frequency: 'Weekly' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between px-4 py-3 bg-[#0d0d0d] rounded-lg">
              <p className="text-xs text-[#888]">{item.label}</p>
              <p className="text-[10px] text-[#444]">{item.frequency}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Event">
        <QuickAddForm
          fields={EVENT_FIELDS}
          onSubmit={data => {
            setEvents(prev => [...prev, { ...data, id: `e-${Date.now()}` } as any])
            setAddModal(false)
          }}
          onCancel={() => setAddModal(false)}
          submitLabel="Add Event"
        />
      </Modal>
    </div>
  )
}
