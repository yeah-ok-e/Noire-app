'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { Heart, Moon, Droplets, Zap, Activity } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { clsx } from 'clsx'
import type { BodyLog } from '@/types/database'

const STRESS_COLORS = ['', 'bg-green-500', 'bg-green-400', 'bg-green-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-orange-400', 'bg-orange-500', 'bg-red-400', 'bg-red-500', 'bg-crisis']

function ScaleInput({
  label, value, onChange, max = 10,
}: {
  label: string; value: number; onChange: (v: number) => void; max?: number
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-[10px] uppercase tracking-widest text-text-muted">{label}</label>
        <span className="text-xs text-accent">{value}/{max}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={clsx(
              'flex-1 h-6 rounded transition-all duration-150',
              i < value ? STRESS_COLORS[value] || 'bg-accent' : 'bg-surface-2 border border-border'
            )}
          />
        ))}
      </div>
    </div>
  )
}

function DaySquare({ log, label }: { log: Partial<BodyLog> | null; label: string }) {
  const stress = log?.stress_level || 0
  const color = stress === 0 ? 'bg-surface border border-border'
    : stress <= 3 ? 'bg-green-500/40'
    : stress <= 6 ? 'bg-yellow-500/40'
    : 'bg-crisis/40'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={clsx('w-10 h-10 rounded-lg', color)} title={log ? `Stress: ${log.stress_level}, Energy: ${log.energy_level}` : 'No log'} />
      <span className="text-[9px] text-text-muted">{label}</span>
    </div>
  )
}

export default function BodyPage() {
  const [logs, setLogs] = useState<BodyLog[]>([])
  const [nsNote, setNsNote] = useState('')
  const [form, setForm] = useState({
    sleep_hours: 7,
    stress_level: 5,
    hydration_oz: 64,
    workout_done: false,
    workout_note: '',
    meals: '',
    energy_level: 5,
    nervous_system_note: '',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const newLog: BodyLog = {
      id: `log-${Date.now()}`,
      user_id: 'demo',
      log_date: new Date().toISOString().split('T')[0],
      ...form,
      workout_note: form.workout_note || null,
      meals: form.meals || null,
      nervous_system_note: form.nervous_system_note || null,
      created_at: new Date().toISOString(),
    }
    setLogs(prev => {
      const filtered = prev.filter(l => l.log_date !== newLog.log_date)
      return [...filtered, newLog]
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = logs.find(l => l.log_date === dateStr) || null
    return { date, dateStr, log, label: format(date, 'EE')[0] }
  })

  // Burnout risk
  const recentLogs = last7Days.map(d => d.log).filter(Boolean) as BodyLog[]
  const avgStress = recentLogs.length > 0
    ? recentLogs.reduce((s, l) => s + (l.stress_level || 0), 0) / recentLogs.length
    : 0
  const avgSleep = recentLogs.length > 0
    ? recentLogs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / recentLogs.length
    : 7
  const burnoutRisk = avgStress > 7 || avgSleep < 5 ? 'high'
    : avgStress > 5 || avgSleep < 6.5 ? 'medium'
    : 'low'

  const burnoutColors = { high: 'text-crisis', medium: 'text-yellow-400', low: 'text-green-400' }

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-text-primary font-serif text-xl">Body</h1>
        <p className="text-text-muted text-xs mt-0.5">Nervous System Log</p>
      </div>

      {/* 7-Day History */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Last 7 Days</p>
        <div className="flex justify-between">
          {last7Days.map(({ log, label, dateStr }) => (
            <DaySquare key={dateStr} log={log} label={label} />
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/40" />
            <span className="text-[9px] text-text-muted">Low stress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/40" />
            <span className="text-[9px] text-text-muted">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-crisis/40" />
            <span className="text-[9px] text-text-muted">High stress</span>
          </div>
        </div>
      </div>

      {/* Burnout Risk */}
      <Card variant="default" className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Burnout Risk</p>
            <p className={clsx('text-xl font-medium capitalize mt-1', burnoutColors[burnoutRisk])}>
              {burnoutRisk}
            </p>
          </div>
          <Activity size={28} className={clsx('opacity-50', burnoutColors[burnoutRisk])} />
        </div>
        {recentLogs.length === 0 && (
          <p className="text-xs text-text-muted mt-1">Based on logged data (none yet)</p>
        )}
      </Card>

      {/* Today's Log Form */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">
          Today — {format(new Date(), 'MMMM d')}
        </p>
        <div className="space-y-5">
          {/* Sleep */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Moon size={12} className="text-blue-400" />
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Sleep Hours</label>
              <span className="ml-auto text-xs text-accent">{form.sleep_hours}h</span>
            </div>
            <input
              type="range" min={0} max={12} step={0.5}
              value={form.sleep_hours}
              onChange={e => setForm(p => ({ ...p, sleep_hours: Number(e.target.value) }))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[9px] text-text-muted mt-0.5">
              <span>0h</span><span>6h</span><span>12h</span>
            </div>
          </div>

          <ScaleInput
            label="Stress Level"
            value={form.stress_level}
            onChange={v => setForm(p => ({ ...p, stress_level: v }))}
          />

          <ScaleInput
            label="Energy Level"
            value={form.energy_level}
            onChange={v => setForm(p => ({ ...p, energy_level: v }))}
          />

          {/* Hydration */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={12} className="text-blue-400" />
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Hydration</label>
              <span className="ml-auto text-xs text-accent">{form.hydration_oz} oz</span>
            </div>
            <input
              type="range" min={0} max={128} step={8}
              value={form.hydration_oz}
              onChange={e => setForm(p => ({ ...p, hydration_oz: Number(e.target.value) }))}
              className="w-full accent-accent"
            />
          </div>

          {/* Workout */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.workout_done}
                onChange={e => setForm(p => ({ ...p, workout_done: e.target.checked }))}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-text-secondary">Workout done</span>
            </label>
          </div>

          {form.workout_done && (
            <input
              value={form.workout_note}
              onChange={e => setForm(p => ({ ...p, workout_note: e.target.value }))}
              placeholder="Workout notes..."
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors"
            />
          )}

          {/* Meals */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Meals</label>
            <textarea
              value={form.meals}
              onChange={e => setForm(p => ({ ...p, meals: e.target.value }))}
              placeholder="What did you eat today..."
              rows={2}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors resize-none"
            />
          </div>

          {/* Nervous System Note */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Nervous System Note</label>
            <textarea
              value={form.nervous_system_note}
              onChange={e => setForm(p => ({ ...p, nervous_system_note: e.target.value }))}
              placeholder="How is your nervous system today? Patterns, tension, ease..."
              rows={2}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            className={clsx(
              'w-full py-3 rounded-lg border text-sm font-medium transition-all duration-200',
              saved
                ? 'border-green-500/50 text-green-400 bg-green-500/10'
                : 'border-accent text-accent hover:bg-accent/10'
            )}
          >
            {saved ? 'Logged ✓' : 'Save Today\'s Log'}
          </button>
        </div>
      </div>
    </div>
  )
}
