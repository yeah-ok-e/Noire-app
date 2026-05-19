'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { RefreshCw, Activity, Moon, Zap, Brain, Shield, TrendingUp, Flame, Heart, Paperclip, ChevronDown, ChevronRight, Play, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { clsx } from 'clsx'
import type { BodyLog } from '@/types/database'

const IGNITION_MESSAGES = [
  "The man building an empire doesn't have sick days. The body is infrastructure. Fortify it.",
  "Every rep is a statement: I'm still here, I'm still building, nothing has stopped me.",
  "You're not just training your body. You're training your mind to handle pressure. Push.",
  "The Coldest MF Alive doesn't fold under weight. The weight bends to you.",
  "Legacy isn't just what you leave behind — it's the body you built it in. Make it last.",
  "Your kids are watching a man who handles hard things. Give them something to see.",
  "Pain is information. Discomfort is growth. Everything else is noise. Go.",
  "This body is the vehicle for everything. The brand, the family, the legacy. Maintain it with respect.",
  "Champions train when they don't feel like it. That's what makes them champions. Let's go.",
  "In 10 years you'll look back at today. Make sure the man in the mirror earned it.",
  "The pressure outside is building you. The pressure you put on iron builds you faster.",
  "Eligah Lewis, the man who built everything from nothing, started with this — showing up.",
  "Vigor. Valor. Victory. It starts here, with the body that carries all three.",
  "You are MIND, BODY, and SPIRIT. One is here. Honor all three. Move.",
  "When the world was falling, you went to the gym. That's the discipline that builds dynasties.",
  "WISE. WORTHY. WEALTHY. WORRY FREE. None of it lands without the body to carry it.",
  "The coldest versions of men are built in the moments no one is watching. Build now.",
]

const HEALTH_AGENTS = [
  {
    id: 'trainer', code: 'Trainer', color: '#d4af7a', dept: 'Training & Programming', pulse: true,
    status: 'Week 3 hypertrophy block — progressive overload on track',
    brief: 'Full training program active. Current block: hypertrophy (8–12 rep range). Progressive overload tracked every session. Adaptation assessment in 4 days. Next block: strength (5×5 protocol).',
    approvals: ['Confirm overload increments for this week', 'Approve deload week scheduling'],
    metrics: [{ label: 'Block', value: 'Hypertrophy' }, { label: 'Week', value: '3 of 8' }, { label: 'Adherence', value: '82%' }],
  },
  {
    id: 'nutrition', code: 'Nutrition', color: '#4ade80', dept: 'Fuel & Recovery', pulse: true,
    status: 'Protein target 195g/day — tracking at 167g average',
    brief: 'Managing macros for recomposition. Protein target: 195g/day. Carb cycling: high on training days, moderate on rest. Inflammation protocol: anti-inflammatory food overlay active. Protein timing: within 30min post-workout.',
    approvals: ['Confirm carb cycling adjustment for rest days', 'Review pre-workout nutrition timing'],
    metrics: [{ label: 'Protein', value: '195g/day' }, { label: 'Calories', value: '2,850 kcal' }, { label: 'Protocol', value: 'Recomp' }],
  },
  {
    id: 'recovery', code: 'Recovery', color: '#60a5fa', dept: 'Rest & Restoration', pulse: false,
    status: 'Sleep avg 6.2h — recovery deficit building, address this week',
    brief: 'Recovery quality below optimal. Sleep avg: 6.2h (target: 7.5h+). HRV trending down. Cortisol elevated from financial stress. Recommendation: prioritize earlier sleep time, magnesium glycinate 400mg before bed, no screens 1h before sleep.',
    approvals: ['Adjust training volume given current recovery deficit', 'Approve supplementation protocol'],
    metrics: [{ label: 'Sleep Avg', value: '6.2h' }, { label: 'Target', value: '7.5h' }, { label: 'HRV', value: 'Declining' }],
  },
  {
    id: 'performance', code: 'Performance', color: '#f472b6', dept: 'Athletic Output', pulse: false,
    status: 'Explosive power improving — sprint protocol queued Saturday',
    brief: 'Athletic performance tracking. Focus: functional strength, explosive power, mobility. Injury prevention protocol active. Benchmark test in 2 weeks. Current gaps: hip mobility, shoulder internal rotation.',
    approvals: ['Review mobility deficit report', 'Approve addition of sprint protocol'],
    metrics: [{ label: 'Focus', value: 'Power + Mobility' }, { label: 'Benchmark', value: '2 weeks' }, { label: 'Status', value: 'Improving' }],
  },
  {
    id: 'longevity', code: 'Longevity', color: '#a78bfa', dept: 'Long-Game Health', pulse: false,
    status: 'Bloodwork pending — inflammation markers unconfirmed',
    brief: 'Long-term health optimization. Priority: anti-inflammation, hormonal health, biological age. Protocol: Zone 2 cardio 2×/week, anti-inflammatory foods, stress management. Bloodwork panel needed within 30 days: testosterone, CRP, cortisol, metabolic panel.',
    approvals: ['Schedule annual bloodwork panel within 30 days', 'Review longevity supplement stack'],
    metrics: [{ label: 'Priority', value: 'Anti-inflammation' }, { label: 'Cardio', value: '2× Zone 2/wk' }, { label: 'Bloodwork', value: 'Schedule' }],
  },
  {
    id: 'mind', code: 'Mind', color: '#facc15', dept: 'Cognitive Performance', pulse: true,
    status: 'High cortisol actively limiting muscle gains — protocol active',
    brief: 'Stress-body nexus: current financial pressure is elevating cortisol, which directly suppresses testosterone production and muscle protein synthesis. Protocol: morning sunlight (within 30min of waking), cold shower or cold face plunge, 5–10min breathwork. Mindset anchors: active.',
    approvals: ['Review stress-cortisol-muscle impact report', 'Approve cold exposure morning protocol'],
    metrics: [{ label: 'Stress', value: 'Elevated' }, { label: 'Focus', value: 'Strong' }, { label: 'Protocol', value: 'Active' }],
  },
]

const TODAY_WORKOUT = {
  name: 'Push Day A — Hypertrophy',
  focus: 'Chest · Shoulders · Triceps',
  duration: '55–65 min',
  intensity: 'High',
  note: 'Progressive overload from last session. Increase bench press by 5 lbs if last set felt clean.',
  exercises: [
    { name: 'Barbell Bench Press', sets: '4', reps: '8–10', rest: '2 min', cue: 'Control the eccentric. Full ROM.' },
    { name: 'Incline Dumbbell Press', sets: '3', reps: '10–12', rest: '90s', cue: 'Stretch at the bottom. Squeeze at top.' },
    { name: 'Cable Lateral Raises', sets: '4', reps: '12–15', rest: '60s', cue: 'Elbows lead. Light and strict.' },
    { name: 'Overhead Press (DB)', sets: '3', reps: '10–12', rest: '90s', cue: 'Brace core. No back arch.' },
    { name: 'Skull Crushers (EZ bar)', sets: '3', reps: '10–12', rest: '90s', cue: 'Keep elbows in. Full extension.' },
    { name: 'Tricep Pushdown (rope)', sets: '3', reps: '12–15', rest: '60s', cue: 'Full lockout at bottom.' },
  ],
}

const RESEARCH = [
  {
    title: 'Protein synthesis: the 30g/meal cap is outdated',
    source: 'Sports Science Journal', tag: 'Nutrition',
    insight: 'Recent studies show muscle protein synthesis can utilize up to 50–60g per meal when in a recomposition state with active training. Total daily protein matters more than per-meal limits.',
  },
  {
    title: "Zone 2 cardio & longevity — the Attia protocol",
    source: 'Peter Attia Research', tag: 'Longevity',
    insight: '45–60 min of Zone 2 cardio (conversational pace) 3× per week is the single highest-ROI longevity intervention available. Improves mitochondrial function, metabolic health, and VO2max.',
  },
  {
    title: 'Cold exposure: cortisol, mood & muscle retention',
    source: 'Huberman Lab Protocol', tag: 'Recovery',
    insight: 'Morning cold water exposure reduces cortisol spikes by up to 35%, raises dopamine baseline for 3–4 hours, and improves mood regulation. Optimal: 2–3 min cold shower within 1h of waking.',
  },
  {
    title: 'Sleep architecture & testosterone production',
    source: 'Endocrinology Review 2024', tag: 'Performance',
    insight: 'Each hour of lost sleep below 7h reduces testosterone production by 10–15%. Deep sleep (stages 3–4) is when 70% of daily testosterone is released. Sleep is the most anabolic tool available.',
  },
  {
    title: 'Creatine & cognitive function under stress',
    source: 'Neuroscience Letters 2024', tag: 'Mind',
    insight: 'Creatine monohydrate (5g/day) shows measurable improvements in working memory, cognitive performance, and mood during high-stress periods — not just in athletic performance.',
  },
  {
    title: 'Resistance training & lifespan extension',
    source: 'British Journal of Sports Medicine', tag: 'Longevity',
    insight: '3× weekly strength training is associated with a 30–35% reduction in all-cause mortality. Grip strength at age 40 is one of the strongest predictors of health outcomes at 70.',
  },
]

const REALITY_CHECKS = [
  { label: 'Weight vs Target', current: '196 lbs', target: '188 lbs', note: 'Recomp, not just cut. Build while reducing fat.' },
  { label: 'Sleep vs Target', current: '6.2h avg', target: '7.5h', note: 'This is actively costing muscle and testosterone.' },
  { label: 'Training Frequency', current: '3×/wk', target: '4×/wk', note: 'Add one session. Anything counts.' },
  { label: 'Protein Intake', current: '167g/day', target: '195g/day', note: 'Close. One protein shake fixes the gap.' },
]

function ScaleInput({ label, value, onChange, max = 10 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
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
            className={clsx('flex-1 h-5 rounded transition-all',
              i < value
                ? value <= 3 ? 'bg-green-400' : value <= 6 ? 'bg-yellow-400' : 'bg-crisis'
                : 'bg-surface-2 border border-border'
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default function BodyPage() {
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * IGNITION_MESSAGES.length))
  const [selectedAgent, setSelectedAgent] = useState<typeof HEALTH_AGENTS[0] | null>(null)
  const [workoutExpanded, setWorkoutExpanded] = useState(false)
  const [checkedExercises, setCheckedExercises] = useState<number[]>([])
  const [logs, setLogs] = useState<BodyLog[]>([])
  const [logOpen, setLogOpen] = useState(false)
  const [form, setForm] = useState({ sleep_hours: 7, stress_level: 5, energy_level: 7, hydration_oz: 64, workout_done: false, notes: '' })
  const [saved, setSaved] = useState(false)

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const ds = format(date, 'yyyy-MM-dd')
    return { date, ds, log: logs.find(l => l.log_date === ds) || null, label: format(date, 'EE')[0] }
  })

  const recentLogs = last7.map(d => d.log).filter(Boolean) as BodyLog[]
  const avgSleep = recentLogs.length ? recentLogs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / recentLogs.length : 0
  const avgStress = recentLogs.length ? recentLogs.reduce((s, l) => s + (l.stress_level || 0), 0) / recentLogs.length : 0

  const regenerate = () => {
    let next = msgIndex
    while (next === msgIndex) next = Math.floor(Math.random() * IGNITION_MESSAGES.length)
    setMsgIndex(next)
  }

  const handleSave = () => {
    const log: BodyLog = {
      id: `log-${Date.now()}`, user_id: 'demo',
      log_date: new Date().toISOString().split('T')[0],
      sleep_hours: form.sleep_hours, stress_level: form.stress_level,
      energy_level: form.energy_level, hydration_oz: form.hydration_oz,
      workout_done: form.workout_done, workout_note: form.notes || null,
      meals: null, nervous_system_note: null, created_at: new Date().toISOString(),
    }
    setLogs(prev => [...prev.filter(l => l.log_date !== log.log_date), log])
    setSaved(true)
    setTimeout(() => { setSaved(false); setLogOpen(false) }, 1500)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-text-primary font-serif text-xl">Body</h1>
        <p className="text-text-muted text-xs mt-0.5">The machine that carries everything. Protect it.</p>
      </div>

      {/* Ignition — motivational message */}
      <div className="bg-surface border border-accent/20 rounded-xl p-5">
        <div className="flex items-start gap-2 mb-3">
          <Flame size={14} className="text-accent flex-shrink-0 mt-0.5" />
          <p className="text-[10px] uppercase tracking-widest text-accent">Ignition</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-text-primary leading-relaxed font-medium"
          >
            {IGNITION_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
        <button
          onClick={regenerate}
          className="flex items-center gap-1.5 text-[10px] text-text-muted hover:text-accent transition-colors mt-4 uppercase tracking-wider"
        >
          <RefreshCw size={10} />New message
        </button>
      </div>

      {/* 7-Day Heatmap */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Last 7 Days</p>
        <div className="flex justify-between gap-1">
          {last7.map(({ log, label, ds }) => {
            const stress = log?.stress_level || 0
            const color = !log ? 'bg-surface border border-border'
              : stress <= 3 ? 'bg-green-400/40'
              : stress <= 6 ? 'bg-yellow-400/40'
              : 'bg-crisis/40'
            return (
              <div key={ds} className="flex flex-col items-center gap-1 flex-1">
                <div className={clsx('w-full h-10 rounded-lg', color)} />
                <span className="text-[9px] text-text-muted">{label}</span>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-surface rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Sleep Avg</p>
            <p className={clsx('text-sm font-medium', avgSleep < 6 ? 'text-crisis' : avgSleep < 7 ? 'text-yellow-400' : 'text-green-400')}>
              {avgSleep ? `${avgSleep.toFixed(1)}h` : '—'}
            </p>
          </div>
          <div className="bg-surface rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Stress Avg</p>
            <p className={clsx('text-sm font-medium', avgStress > 7 ? 'text-crisis' : avgStress > 5 ? 'text-yellow-400' : 'text-green-400')}>
              {avgStress ? `${avgStress.toFixed(1)}/10` : '—'}
            </p>
          </div>
          <div className="bg-surface rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Sessions</p>
            <p className="text-sm font-medium text-text-primary">
              {recentLogs.filter(l => l.workout_done).length}/7
            </p>
          </div>
        </div>
      </div>

      {/* AI Health Board */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">AI Health Board</p>
        <p className="text-xs text-text-muted mb-3">6 specialist agents managing every dimension of your physical performance.</p>
        <div className="grid grid-cols-2 gap-2">
          {HEALTH_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className="bg-surface border border-[#1c1c1c] rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors relative"
            >
              {agent.pulse && (
                <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              )}
              <p className="text-sm font-medium" style={{ color: agent.color }}>{agent.code}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{agent.dept}</p>
              <p className="text-[10px] text-text-muted mt-2 leading-relaxed line-clamp-2">{agent.status}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Workout */}
      <div>
        <button
          onClick={() => setWorkoutExpanded(!workoutExpanded)}
          className="w-full bg-surface border border-border rounded-xl p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Today's Workout</p>
              <p className="text-sm font-medium text-text-primary">{TODAY_WORKOUT.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{TODAY_WORKOUT.focus} · {TODAY_WORKOUT.duration}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-accent border border-accent/30 px-2 py-0.5 rounded">{TODAY_WORKOUT.intensity}</span>
              {workoutExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            </div>
          </div>
        </button>

        <AnimatePresence>
          {workoutExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-surface-2 border border-border border-t-0 rounded-b-xl p-4 space-y-3">
                <p className="text-xs text-text-muted italic">"{TODAY_WORKOUT.note}"</p>
                <div className="space-y-2">
                  {TODAY_WORKOUT.exercises.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setCheckedExercises(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                      className={clsx(
                        'w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left',
                        checkedExercises.includes(i) ? 'border-accent/30 bg-accent/5' : 'border-border bg-surface'
                      )}
                    >
                      {checkedExercises.includes(i)
                        ? <CheckCircle size={14} className="text-accent flex-shrink-0 mt-0.5" />
                        : <Play size={14} className="text-text-muted flex-shrink-0 mt-0.5" />
                      }
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={clsx('text-sm font-medium', checkedExercises.includes(i) ? 'text-text-muted line-through' : 'text-text-primary')}>
                            {ex.name}
                          </p>
                          <span className="text-[10px] text-text-muted flex-shrink-0">{ex.sets} × {ex.reps} · {ex.rest}</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5 italic">{ex.cue}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] text-text-muted">
                    {checkedExercises.length}/{TODAY_WORKOUT.exercises.length} complete
                    {checkedExercises.length === TODAY_WORKOUT.exercises.length && (
                      <span className="text-accent ml-2">— Session done. Log it.</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reality Check */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Reality Check</p>
        <div className="space-y-2">
          {REALITY_CHECKS.map((check, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-text-primary">{check.label}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-text-muted">{check.current}</span>
                  <span className="text-text-muted">→</span>
                  <span className="text-accent">{check.target}</span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted italic">{check.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Research Feed */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Studies & Protocols</p>
        <div className="space-y-2">
          {RESEARCH.map((item, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm text-text-primary font-medium leading-snug">{item.title}</p>
                <span className="text-[9px] uppercase tracking-wider border border-border text-text-muted px-1.5 py-0.5 rounded flex-shrink-0">{item.tag}</span>
              </div>
              <p className="text-[10px] text-text-muted mb-2">{item.source}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Log */}
      <div>
        <button
          onClick={() => setLogOpen(!logOpen)}
          className="w-full flex items-center justify-between py-3 px-4 bg-surface border border-border rounded-xl"
        >
          <p className="text-sm text-text-primary">Log Today — {format(new Date(), 'MMM d')}</p>
          {logOpen ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
        </button>

        <AnimatePresence>
          {logOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-surface-2 border border-border border-t-0 rounded-b-xl p-4 space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1.5"><Moon size={10} />Sleep</label>
                    <span className="text-xs text-accent">{form.sleep_hours}h</span>
                  </div>
                  <input type="range" min={0} max={12} step={0.5} value={form.sleep_hours}
                    onChange={e => setForm(p => ({ ...p, sleep_hours: Number(e.target.value) }))}
                    className="w-full accent-[#d4af7a]" />
                </div>

                <ScaleInput label="Stress Level" value={form.stress_level} onChange={v => setForm(p => ({ ...p, stress_level: v }))} />
                <ScaleInput label="Energy Level" value={form.energy_level} onChange={v => setForm(p => ({ ...p, energy_level: v }))} />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.workout_done}
                      onChange={e => setForm(p => ({ ...p, workout_done: e.target.checked }))}
                      className="w-4 h-4 accent-[#d4af7a]" />
                    <span className="text-sm text-text-secondary">Workout done today</span>
                  </label>
                </div>

                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Notes — how do you feel, what's notable..."
                  rows={2}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors resize-none"
                />

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-muted hover:text-text-primary transition-colors">
                    <Paperclip size={11} />Attach (Dr visit, labs...)
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  className={clsx(
                    'w-full py-3 rounded-lg border text-sm font-medium transition-all',
                    saved ? 'border-green-500/50 text-green-400 bg-green-400/10' : 'border-accent text-accent hover:bg-accent/10'
                  )}
                >
                  {saved ? 'Logged ✓' : 'Save Log'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setSelectedAgent(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full bg-surface border-t border-border rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3">
              <p className="text-xl font-medium" style={{ color: selectedAgent.color }}>{selectedAgent.code}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">{selectedAgent.dept}</p>
              <span className={clsx('ml-auto w-2 h-2 rounded-full', selectedAgent.pulse ? 'bg-green-400 animate-pulse' : 'bg-[#3a3a3a]')} />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{selectedAgent.brief}</p>
            <div className="grid grid-cols-3 gap-2">
              {selectedAgent.metrics.map(m => (
                <div key={m.label} className="bg-surface-2 rounded-lg p-2.5 text-center">
                  <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{m.label}</p>
                  <p className="text-xs font-medium text-text-primary">{m.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Approvals Needed</p>
              <div className="space-y-2">
                {selectedAgent.approvals.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-surface-2 rounded-lg border border-accent/15">
                    <span className="text-accent text-[10px] mt-0.5">→</span>
                    <p className="text-xs text-text-secondary">{a}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="w-full py-2.5 rounded-lg border border-border text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
