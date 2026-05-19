'use client'

import { useState } from 'react'
import {
  format, addDays, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, isToday, getDay, parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Compass } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'

const now = new Date()

const DEMO_EVENTS = [
  { id: 'e1', title: 'LIHEAP Appointment', start_at: addDays(now, 2).toISOString(), category: 'assistance', priority: 'critical' },
  { id: 'e2', title: 'Certify Unemployment (PA UC)', start_at: addDays(now, 2).toISOString(), category: 'income', priority: 'critical' },
  { id: 'e3', title: 'Expected UC Deposit', start_at: addDays(now, 4).toISOString(), category: 'income', priority: 'high' },
  { id: 'e4', title: 'Follow up — Keisha Events (Noire)', start_at: addDays(now, 3).toISOString(), category: 'noire', priority: 'high' },
  { id: 'e5', title: 'Township assistance follow-up', start_at: addDays(now, 5).toISOString(), category: 'assistance', priority: 'medium' },
]

const SUGGESTED_EXPERIENCES = [
  { title: 'First Friday Art Walk', category: 'Culture', note: 'Be a fixture in the city\'s cultural scene. Know the art. Know the artists.', frequency: 'Monthly', icon: '◆' },
  { title: 'City Council Meeting', category: 'Civic', note: 'Know your city. Know the mayor. Be known. The fixture you want to be starts here.', frequency: 'Biweekly', icon: '◆' },
  { title: 'Local Founder Breakfast', category: 'Network', note: 'Eat with people building things. Trade intel. Expand the circle.', frequency: 'Monthly', icon: '◆' },
  { title: 'Museum of African American History', category: 'Legacy', note: 'Know where you come from. Feed the vision. DC trip — plan it.', frequency: 'Annually', icon: '◆' },
  { title: 'TEDx City Event', category: 'Growth', note: 'Absorb the best ideas the city has to offer. Then build bigger.', frequency: 'Quarterly', icon: '◆' },
  { title: "Mayor's Innovation Summit", category: 'Civic', note: 'Be in rooms where city direction is set. This is how you build real leverage.', frequency: 'Annually', icon: '◆' },
  { title: 'Keynote / Lecture Series', category: 'Growth', note: 'Learn from people who built what you\'re building. Every room is a curriculum.', frequency: 'As available', icon: '◆' },
  { title: 'Noire Pop-up Event', category: 'Brand', note: 'Performance art meets retail. Every pop-up is a cultural moment, not a transaction.', frequency: 'Seasonal', icon: '◆' },
]

const CATEGORY_COLORS: Record<string, string> = {
  income: 'border-[#d4af7a]/40 bg-[#d4af7a]/10',
  assistance: 'border-green-500/30 bg-green-500/10',
  noire: 'border-[#888]/30 bg-[#888]/10',
  family: 'border-blue-500/30 bg-blue-500/10',
  health: 'border-purple-500/30 bg-purple-500/10',
  other: 'border-[#1c1c1c] bg-surface',
}

const EVENT_FIELDS: FormField[] = [
  { name: 'title', label: 'Event Title', type: 'text', required: true },
  { name: 'start_at', label: 'Date', type: 'date', required: true },
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

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(now))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [events, setEvents] = useState(DEMO_EVENTS)
  const [addModal, setAddModal] = useState(false)
  const [view, setView] = useState<'month' | 'agenda'>('month')

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const firstDayOfMonth = getDay(startOfMonth(currentMonth))
  const leadingBlanks = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const upcoming = [...events].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
  const selectedDayEvents = selectedDay ? events.filter(e => isSameDay(parseISO(e.start_at), selectedDay)) : []

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary font-serif text-xl">Calendar</h1>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            {(['month', 'agenda'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={clsx('px-3 py-1.5 text-xs transition-colors', view === v ? 'bg-surface-2 text-accent' : 'text-text-muted')}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setAddModal(true)} className="flex items-center gap-1 text-[10px] text-accent">
            <Plus size={12} />Add
          </button>
        </div>
      </div>

      {/* Month Calendar */}
      {view === 'month' && (
        <div>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 text-text-muted hover:text-text-primary transition-colors">
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm text-text-primary font-medium">{format(currentMonth, 'MMMM yyyy')}</p>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 text-text-muted hover:text-text-primary transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-text-muted py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} className="h-10" />
            ))}
            {monthDays.map(day => {
              const dayEvents = events.filter(e => isSameDay(parseISO(e.start_at), day))
              const isSelected = selectedDay && isSameDay(day, selectedDay)
              const _isToday = isToday(day)
              const inMonth = isSameMonth(day, currentMonth)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={clsx(
                    'h-10 rounded-lg flex flex-col items-center justify-start pt-1.5 transition-all relative',
                    isSelected ? 'bg-accent/20 border border-accent/50' :
                    _isToday ? 'bg-surface-2 border border-accent/30' :
                    'bg-surface hover:bg-surface-2',
                    !inMonth && 'opacity-30'
                  )}
                >
                  <span className={clsx('text-[11px] leading-none', _isToday ? 'text-accent font-medium' : isSelected ? 'text-accent' : 'text-text-secondary')}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-accent opacity-80" />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Day Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-primary font-medium">{format(selectedDay, 'EEEE, MMMM d')}</p>
              <button
                onClick={() => { setAddModal(true) }}
                className="flex items-center gap-1 text-[10px] text-accent"
              >
                <Plus size={10} />Add event
              </button>
            </div>
            {selectedDayEvents.length === 0 ? (
              <p className="text-xs text-text-muted">No events. Clear day.</p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map(event => (
                  <div key={event.id} className={clsx('border rounded-lg p-3', CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other)}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-primary">{event.title}</p>
                      <StatusBadge status={event.priority} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agenda / Upcoming */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Upcoming</p>
        <div className="space-y-2">
          {upcoming.slice(0, 8).map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx('border rounded-lg p-4', CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{event.title}</p>
                  <p className="text-[10px] text-text-muted mt-1">{format(parseISO(event.start_at), 'EEE, MMM d')}</p>
                </div>
                <StatusBadge status={event.priority} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recurring */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Recurring</p>
        <div className="space-y-1.5">
          {[
            { label: 'PA UC Certification', frequency: 'Biweekly — Tuesdays' },
            { label: 'SNAP Recertification', frequency: 'Monthly' },
            { label: 'Noire Instagram Post', frequency: 'Weekly minimum' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between px-4 py-3 bg-surface border border-border rounded-lg">
              <p className="text-xs text-text-secondary">{item.label}</p>
              <p className="text-[10px] text-text-muted">{item.frequency}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Experiences */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Compass size={12} className="text-accent" />
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Suggested Experiences</p>
        </div>
        <p className="text-xs text-text-muted mb-3">Aligned with building a life of real texture and civic presence.</p>
        <div className="space-y-2">
          {SUGGESTED_EXPERIENCES.map((exp, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-text-primary">{exp.title}</p>
                    <span className="text-[9px] uppercase tracking-wider text-text-muted border border-border px-1.5 py-0.5 rounded">{exp.category}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{exp.note}</p>
                </div>
                <p className="text-[10px] text-text-muted flex-shrink-0 whitespace-nowrap">{exp.frequency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Event">
        <QuickAddForm
          fields={EVENT_FIELDS}
          onSubmit={data => {
            setEvents(prev => [...prev, { ...data, id: `e-${Date.now()}` } as typeof DEMO_EVENTS[0]])
            setAddModal(false)
          }}
          onCancel={() => setAddModal(false)}
          submitLabel="Add Event"
        />
      </Modal>
    </div>
  )
}
