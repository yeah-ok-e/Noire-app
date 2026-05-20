'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, TrendingUp, CheckCircle, Circle, ChevronRight, X,
  Phone, Mail, ExternalLink, FileText, Copy, Check, MapPin,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CrisisBanner } from '@/components/modules/CrisisMode'
import { OfflinePacket } from '@/components/modules/OfflinePacket'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { useCrisisMode } from '@/lib/hooks/useCrisisMode'
import { useOffline } from '@/lib/hooks/useOffline'
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters'
import { clsx } from 'clsx'

const NON_NEGOTIABLES = [
  { id: 'nn-money', label: 'Check the money', sub: 'Know your number every day' },
  { id: 'nn-noire', label: 'Make a Noire move', sub: 'The brand never sleeps' },
  { id: 'nn-legacy', label: 'Log to Legacy', sub: 'Document the journey in real time' },
  { id: 'nn-body', label: 'Move the body', sub: 'Strength is infrastructure' },
  { id: 'nn-family', label: 'Connect with family', sub: "Don't lose what you're building for" },
]

const EMOTIONAL_OPTIONS = [
  { value: 'calm', label: 'Calm', color: 'text-blue-400' },
  { value: 'focused', label: 'Focused', color: 'text-accent' },
  { value: 'determined', label: 'Determined', color: 'text-green-400' },
  { value: 'stressed', label: 'Stressed', color: 'text-yellow-400' },
  { value: 'overwhelmed', label: 'Overwhelmed', color: 'text-crisis' },
]

const AFFIRMATION = "I'm AMAZING, I'm UNSTOPPABLE and nothing can get in my way. I'm a LOVING and COMPASSIONATE being that is not led astray. I'm MIND, BODY and SPIRIT and careful with what I say. I'm WISE, WORTHY, WEALTHY and WORRY FREE for I've had a better day today than I did yesterday. I'm him. The Coldest MF Alive. Continue to Lead with Vigor, Act with Valor, and remain Victorious. God got me, My name's Eligah."

type Contact = { name: string; role: string; phone?: string; email?: string; link?: string }
type Script = { type: string; content: string }

type OppIntel = {
  contacts: Contact[]
  steps: string[]
  scripts: Script[]
  docs: string[]
  link?: string
  timeline: string
}

type MoveIntel = {
  why: string
  steps: string[]
  contacts: Contact[]
  scripts: Script[]
  docs: string[]
  deadline: string
  success: string
}

const ADHERENCE_CATEGORIES = [
  { id: 'money', label: 'Money Move', sub: 'Check the number. Make a move.', icon: 'DollarSign', color: '#d4af7a' },
  { id: 'noire', label: 'Noire Move', sub: 'Brand action logged.', icon: 'Gem', color: '#a78bfa' },
  { id: 'body', label: 'Body', sub: 'Movement completed.', icon: 'Heart', color: '#f97316' },
  { id: 'family', label: 'Family', sub: 'Connected today.', icon: 'Home', color: '#22c55e' },
  { id: 'discipline', label: 'Discipline', sub: '5 non-negotiables hit.', icon: 'CheckSquare', color: '#3b82f6' },
  { id: 'reflection', label: 'Reflection', sub: 'Legacy log made.', icon: 'BookOpen', color: '#ec4899' },
]

// Demo: simulate 7-day adherence history (1 = done, 0 = missed)
const ADHERENCE_HISTORY: Record<string, number[]> = {
  money:      [1, 1, 0, 1, 1, 1, 0],
  noire:      [1, 0, 1, 1, 1, 0, 1],
  body:       [0, 1, 1, 1, 0, 1, 1],
  family:     [1, 1, 1, 0, 1, 1, 1],
  discipline: [1, 1, 0, 0, 1, 1, 1],
  reflection: [0, 0, 1, 1, 1, 0, 1],
}

const NEARBY_FOUNDERS = [
  { id: 'nf1', name: 'Marcus Webb', title: 'Founder — Webb Creative Co.', distance: '0.8 mi', tags: ['creative agency', 'brand strategy'], mutual: 2, status: 'hot' },
  { id: 'nf2', name: 'Tanya Osei', title: 'CEO — Elevated Supply Co.', distance: '1.4 mi', tags: ['retail', 'supply chain'], mutual: 1, status: 'warm' },
  { id: 'nf3', name: 'Derek Fontaine', title: 'Director — Philly Fashion Week', distance: '2.1 mi', tags: ['fashion', 'events', 'media'], mutual: 3, status: 'hot' },
]

const OPP_INTEL: Record<string, OppIntel> = {
  o1: {
    contacts: [
      { name: 'PA Unemployment Portal', role: 'Weekly Certification', link: 'https://www.uc.pa.gov', email: '' },
      { name: 'UC Service Center', role: 'Phone Support', phone: '888-313-7284' },
    ],
    steps: [
      'Open uc.pa.gov → log in to your account',
      'Click "Weekly Certification" from your dashboard',
      'Answer: Did not work. Did not earn wages. Available for work.',
      'Submit before 11:59 PM Tuesday',
      'Screenshot the confirmation screen',
      'Direct deposit arrives Thursday morning — confirm in your bank app',
    ],
    scripts: [
      {
        type: 'If you need to call UC instead',
        content: 'Hi, I\'m calling to certify my weekly benefits for the week ending [date]. My claim number is [#]. I did not work, I did not earn any wages, and I was available for and actively seeking work this week.',
      },
      {
        type: 'If asked about a job offer or refusal',
        content: 'I was available for suitable work this week. I did not receive or refuse any job offer.',
      },
    ],
    docs: [],
    link: 'https://www.uc.pa.gov',
    timeline: 'Certify Tuesday by midnight → $450 deposits Thursday morning',
  },
  o2: {
    contacts: [
      { name: 'LIHEAP Energy Assistance', role: 'Your appointment office', phone: '215-413-0200' },
      { name: 'PECO Customer Service', role: 'Direct payment arrangement (backup)', phone: '1-800-494-4000' },
    ],
    steps: [
      'Confirm appointment time tonight — set a morning alarm',
      'Gather all documents tonight (list below) — don\'t scramble day-of',
      'Arrive 10 minutes early',
      'Tell them immediately: "I have an overdue balance and children in the home"',
      'Ask specifically about the CRISIS component if balance is past-due',
      'Get a case number and expected timeline before you leave — don\'t leave without it',
    ],
    scripts: [
      {
        type: 'Opening at the appointment',
        content: 'Good morning. I have an appointment for energy assistance. My name is Eligah Lewis. I have an overdue balance on my utility account and children in the home — I was told there\'s a CRISIS program component I should ask about.',
      },
      {
        type: 'If they say you don\'t qualify',
        content: 'Can you tell me specifically what prevents qualification? My income situation has changed recently — I\'m currently on unemployment, not annual salary. Can we recalculate based on current monthly income? And is there another emergency energy program I should be looking at?',
      },
      {
        type: 'Escalation if denied entirely',
        content: 'I have minor children in the home. A utility shutoff would be a hardship. Is there a supervisor I should speak with, or another program at this office that handles emergency situations?',
      },
    ],
    docs: [
      'Photo ID (driver\'s license)',
      'Social Security card',
      'Lease agreement or utility bill as proof of address',
      'PA UC award letter or bank statement showing current income',
      'Most recent utility bill — must show account number and current balance',
    ],
    timeline: 'Attend appointment → approval within 2–5 business days → utility credit applied directly',
  },
  o3: {
    contacts: [
      { name: 'Keisha', role: 'Event Client Lead', phone: '[Keisha\'s number]', email: '[Keisha\'s email]' },
    ],
    steps: [
      'Contact Keisha within 24 hours — leads go cold fast',
      'Get event details: date, venue, number of guests, style/aesthetic direction',
      'Quote: $215/piece single, $195/piece for 3+ (event order)',
      'Lock in with 50% deposit — non-refundable, confirms the order',
      'Collect sizes and preferred style: Classic, Noir, or Custom',
      'Confirm from inventory — flag if custom order needed (7–10 day lead)',
      'Deliver personally if local — first impression matters for referrals',
    ],
    scripts: [
      {
        type: 'Opening text to Keisha',
        content: 'Hey Keisha — this is Eligah from Noire. I heard you were looking at pieces for your event and I\'d love to make that happen. What\'s the vibe and the date? I\'ll make sure you\'re right.',
      },
      {
        type: 'Price conversation',
        content: 'So here\'s how I run it — single pieces are $215, but for an event order I can do $195 each if you\'re grabbing 3 or more. I just need 50% down to lock it in and the rest on delivery. Want me to send you the style sheet?',
      },
      {
        type: 'Closing the deposit',
        content: 'I can hold your pieces today if you send the deposit. I keep inventory tight on purpose — I don\'t want you to lose your sizes. What works for you?',
      },
      {
        type: 'Follow-up if no response after 48 hours',
        content: 'Hey Keisha — just following up on the Noire pieces for your event. I\'ve got inventory available but it moves fast. Let me know and I\'ll hold it for you.',
      },
      {
        type: 'After delivery — referral ask',
        content: 'Keisha, thank you for supporting Noire — genuinely. If anyone at the event asks about the pieces, I\'d love for you to connect them to me. A referral from you means everything.',
      },
    ],
    docs: [],
    timeline: 'Contact within 24h → lock deposit within 48h → fulfill within 7 days → deliver and ask for referrals',
  },
}

const MOVE_INTEL: Record<number, MoveIntel> = {
  1: {
    why: 'Rent overdue is the #1 crisis. Every day it sits unaddressed increases eviction risk and damages the relationship with your landlord. A proactive call from you — not a text, a call — completely changes the dynamic. You\'re accountable, not avoiding. That call alone can buy you 2–3 weeks and preserve the relationship.',
    steps: [
      'Call — don\'t text — your landlord today before 5 PM',
      'Open by acknowledging the delay directly, no excuses, no over-explaining',
      'Propose a specific plan: amount available this week + remainder by exact date',
      'Offer whatever you have today — even $200 shows good faith and changes their posture',
      'Ask for written confirmation of the plan (text or email is fine)',
      'Follow up immediately after the call with a text summarizing what was agreed',
    ],
    contacts: [
      { name: 'Your Landlord', role: 'Property Owner', phone: '[Landlord\'s phone number]' },
    ],
    scripts: [
      {
        type: 'Opening the call',
        content: 'Hi [name], this is Eligah. I\'m calling because I\'m behind on rent and I want to address it with you directly. I\'m not avoiding it — I have a clear picture of what happened and a plan to get right. Can we talk for 5 minutes?',
      },
      {
        type: 'Presenting the payment plan',
        content: 'Here\'s where I\'m at: I can get you $300 by [day] and the remaining $800 by [date, 2 weeks out]. I know that\'s not the full amount today, but I want you to hear it from me directly, and I will not miss those dates. Does that work for you?',
      },
      {
        type: 'If they push back hard',
        content: 'I understand your concern completely. What\'s the minimum you need from me this week to keep things moving? I want to work with you on this — I\'ve been a good tenant and I want to stay that way.',
      },
      {
        type: 'Follow-up text after the call',
        content: 'Hey [name] — thanks for the conversation. Just confirming: I\'ll have $300 to you by [day] and the remaining $800 by [date]. I\'ll follow up with payment confirmation the moment it clears.',
      },
    ],
    docs: [],
    deadline: 'Today — call before 5 PM',
    success: 'Landlord agrees to a specific payment plan in writing. No eviction notice filed. Relationship intact.',
  },
  2: {
    why: 'Unemployment certification is the most reliable, guaranteed cash coming in right now. Missing Tuesday\'s window means waiting another full week — 7 more days without $450 you\'re already owed. There is no acceptable reason to miss this. Set the alarm. Open the portal. Answer the 3 questions. Done.',
    steps: [
      'Set an alarm for Tuesday morning — do this before noon to avoid system slowdowns',
      'Open uc.pa.gov and log in with your credentials',
      'Click "Weekly Certification" on the dashboard',
      'Answer: Did not work. Did not earn wages. Was available and seeking work.',
      'Submit and screenshot the confirmation page',
      'Check your bank Thursday morning — deposit should be there by 9 AM',
    ],
    contacts: [
      { name: 'PA Unemployment Compensation', role: 'Portal & Phone Support', phone: '888-313-7284', link: 'https://www.uc.pa.gov' },
    ],
    scripts: [
      {
        type: 'If the portal is down — call instead',
        content: 'Hi, my name is Eligah Lewis. I\'m calling to certify my weekly benefits for the week ending [date]. My claim number is [#]. I did not work, did not earn any wages, and I was available for and actively seeking work this week.',
      },
      {
        type: 'If asked about work or income',
        content: 'I was available for suitable work this week. I did not receive or refuse any job offers. I did not earn any wages.',
      },
    ],
    docs: ['UC Portal login credentials', 'Claim number (on your award letter)'],
    deadline: 'Tuesday before midnight — deposit arrives Thursday',
    success: 'Certification confirmed. $450 deposits Thursday. Screenshot saved.',
  },
  3: {
    why: 'LIHEAP can eliminate the $180 utility threat entirely — at zero cost to you. The appointment is already scheduled. You show up with the right documents and the right words, and that bill disappears. Do not reschedule. Do not skip. This is free money standing in front of you.',
    steps: [
      'Confirm appointment time tonight — set two alarms',
      'Gather all documents tonight (list below) — do not scramble morning-of',
      'Arrive 10 minutes early',
      'Be direct and clear about hardship — don\'t minimize it',
      'Ask specifically about the CRISIS program for overdue balances',
      'Get your case number and expected timeline before leaving — do not leave without both',
    ],
    contacts: [
      { name: 'LIHEAP Office', role: 'Energy Assistance Program', phone: '215-413-0200' },
      { name: 'PECO Customer Service', role: 'Backup: direct payment arrangement', phone: '1-800-494-4000' },
    ],
    scripts: [
      {
        type: 'Arriving at the appointment',
        content: 'Good morning. I have an appointment for energy assistance. My name is Eligah Lewis. I have an overdue balance on my account and minor children in the home — I was told there\'s a CRISIS component that covers past-due balances.',
      },
      {
        type: 'If they say income is too high',
        content: 'I\'m currently on unemployment — my annual income figure doesn\'t reflect my current monthly reality. Can we recalculate based on current monthly income? My situation has changed significantly in the last 60 days.',
      },
      {
        type: 'Escalation if denied',
        content: 'I have minor children in the home and a utility shutoff would create a hardship. Is there a supervisor I should speak with, or is there another emergency program I qualify for? I want to make sure I\'ve exhausted every option.',
      },
    ],
    docs: [
      'Photo ID (driver\'s license)',
      'Social Security cards — yours + children\'s',
      'Lease agreement or utility bill as proof of address',
      'PA UC award letter or bank statement showing current income',
      'Most recent utility bill showing account number and current balance',
    ],
    deadline: 'Day of appointment — do not reschedule',
    success: 'LIHEAP approves direct payment to utility company. $180 bill covered or significantly reduced. Shutoff threat eliminated.',
  },
}

function ScriptCard({ type, content }: { type: string; content: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="bg-[#0a0a0a] border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2.5 text-left">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">{type}</p>
        <ChevronRight size={12} className={clsx('text-text-muted transition-transform duration-200', open && 'rotate-90')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 border-t border-border">
              <p className="text-xs text-text-secondary leading-relaxed mt-2 italic">"{content}"</p>
              <button onClick={copy} className="mt-2 flex items-center gap-1.5 text-[10px] text-accent hover:opacity-80 transition-opacity">
                {copied ? <Check size={10} /> : <Copy size={10} />}
                {copied ? 'Copied' : 'Copy script'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CommandPage() {
  const { demoData, store, getCurrentCash, completeReminder } = useDemoMode()
  const { isOffline, lastSynced, offlineData } = useOffline()
  const [emotionalState, setEmotionalState] = useState<string | null>(null)
  const [checked, setChecked] = useState<string[]>([])
  const [todayChecked, setTodayChecked] = useState<Set<string>>(new Set(['money', 'family']))
  const [affirmationExpanded, setAffirmationExpanded] = useState(false)
  const [selectedOpp, setSelectedOpp] = useState<typeof demoData.opportunities[0] | null>(null)
  const [selectedMove, setSelectedMove] = useState<typeof demoData.nextMoves[0] | null>(null)

  useEffect(() => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem(`nn-${today}`)
    if (stored) {
      try { setChecked(JSON.parse(stored)) } catch { setChecked([]) }
    }
  }, [])

  const toggleNN = (id: string) => {
    const today = new Date().toDateString()
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(`nn-${today}`, JSON.stringify(next))
      return next
    })
  }

  const cashAmount = getCurrentCash()
  const bills = store.bills
  const reminders = store.reminders.filter(r => !r.completed)
  const { isCrisis, reasons } = useCrisisMode({ cashAmount, bills })
  const cashColor = cashAmount < 500 ? 'text-crisis' : cashAmount < 2000 ? 'text-yellow-400' : 'text-green-400'
  const totalObligations = bills.reduce((sum, b) => b.status !== 'paid' ? sum + b.amount : sum, 0)
  const survivalDays = totalObligations > 0 ? Math.floor(cashAmount / (totalObligations / 30)) : 999
  const allDone = checked.length === NON_NEGOTIABLES.length

  const oppIntel = selectedOpp ? (OPP_INTEL[selectedOpp.id] ?? null) : null
  const moveIntel = selectedMove ? (MOVE_INTEL[selectedMove.order] ?? null) : null

  return (
    <div>
      <CrisisBanner isCrisis={isCrisis} reasons={reasons} />

      <div className="px-4 py-6 space-y-5">
        {/* Status Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted">{format(new Date(), 'EEEE')}</p>
            <p className="text-text-secondary text-sm">{format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">System Status</p>
            <p className={clsx('text-xs font-medium mt-0.5', isCrisis ? 'text-crisis' : 'text-green-400')}>
              {isCrisis ? 'CRISIS ACTIVE' : 'NOMINAL'}
            </p>
          </div>
        </div>

        {/* Cash Status Card */}
        <Card variant={isCrisis ? 'crisis' : 'default'} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent pointer-events-none" />
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Cash on Hand</p>
          <div className="flex items-end gap-3">
            <span className={clsx('text-5xl font-light tracking-tight', cashColor)}>{formatCurrency(cashAmount)}</span>
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Monthly Bills</p>
              <p className="text-sm text-text-primary mt-0.5">{formatCurrency(totalObligations)}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Runway</p>
              <p className={clsx('text-sm mt-0.5', survivalDays < 7 ? 'text-crisis' : 'text-text-primary')}>
                {survivalDays >= 999 ? '—' : `${survivalDays}d`}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Total Debt</p>
              <p className="text-sm text-text-primary mt-0.5">
                {formatCurrency(demoData.debts.reduce((s, d) => s + (d.amount_remaining ?? d.amount), 0))}
              </p>
            </div>
          </div>
        </Card>

        {/* Active Threats */}
        {demoData.threats.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-crisis mb-2 flex items-center gap-1.5">
              <AlertTriangle size={10} />Active Threats
            </p>
            <div className="space-y-2">
              {demoData.threats.map(threat => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface border border-crisis/30 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-text-primary font-medium">{threat.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{threat.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    {threat.amount && <p className="text-crisis font-medium text-sm">{formatCurrency(threat.amount)}</p>}
                    <StatusBadge status={threat.priority} className="mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 5 Non-Negotiables */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1.5">
              <CheckCircle size={10} />5 Non-Negotiables
            </p>
            <p className={clsx('text-[10px] font-medium', allDone ? 'text-accent' : 'text-text-muted')}>
              {checked.length}/5 {allDone ? '— Done' : ''}
            </p>
          </div>
          <div className="space-y-1.5">
            {NON_NEGOTIABLES.map(nn => (
              <button
                key={nn.id}
                onClick={() => toggleNN(nn.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left',
                  checked.includes(nn.id) ? 'border-accent/30 bg-accent/5' : 'border-border bg-surface'
                )}
              >
                <div className={clsx(
                  'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all',
                  checked.includes(nn.id) ? 'border-accent bg-accent' : 'border-border'
                )}>
                  {checked.includes(nn.id) && <CheckCircle size={11} className="text-[#020202]" />}
                </div>
                <div className="flex-1">
                  <p className={clsx('text-sm transition-all', checked.includes(nn.id) ? 'text-text-muted line-through' : 'text-text-primary')}>
                    {nn.label}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">{nn.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Adherence Tracker */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Daily Adherence</p>
            <div className="flex items-center gap-2">
              {(() => {
                const todayScore = Math.round((todayChecked.size / ADHERENCE_CATEGORIES.length) * 100)
                return (
                  <span className={clsx('text-xs font-medium', todayScore >= 90 ? 'text-green-400' : todayScore >= 80 ? 'text-accent' : 'text-crisis')}>
                    {todayScore}% today
                  </span>
                )
              })()}
              <span className="text-[10px] text-text-muted">Goal: 90%</span>
            </div>
          </div>

          {/* Warning if below 80% */}
          {todayChecked.size / ADHERENCE_CATEGORIES.length < 0.8 && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-crisis/10 border border-crisis/30 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-crisis animate-pulse flex-shrink-0" />
              <p className="text-[11px] text-crisis">Below 80% — push to close the gap today.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {ADHERENCE_CATEGORIES.map(cat => {
              const history = ADHERENCE_HISTORY[cat.id]
              const weekRate = Math.round((history.reduce((s, v) => s + v, 0) / history.length) * 100)
              const done = todayChecked.has(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => setTodayChecked(prev => {
                    const next = new Set(prev)
                    if (next.has(cat.id)) next.delete(cat.id)
                    else next.add(cat.id)
                    return next
                  })}
                  className={clsx(
                    'bg-surface border rounded-xl p-3 text-left transition-all',
                    done ? 'border-accent/40 bg-accent/5' : weekRate < 80 ? 'border-crisis/30' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', done ? 'border-accent bg-accent' : 'border-border')} style={done ? {} : { borderColor: cat.color + '60' }}>
                      {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#020202" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                    </div>
                    <span className={clsx('text-[9px] font-medium uppercase tracking-wider', weekRate >= 90 ? 'text-green-400' : weekRate >= 80 ? 'text-accent' : 'text-crisis')}>
                      {weekRate}% / wk
                    </span>
                  </div>
                  <p className="text-xs text-text-primary font-medium">{cat.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{cat.sub}</p>
                  {/* 7-day mini-bar */}
                  <div className="flex gap-0.5 mt-2">
                    {history.map((v, i) => (
                      <div key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: v ? cat.color : '#1c1c1c' }} />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Opportunities */}
        {demoData.opportunities.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-accent mb-2 flex items-center gap-1.5">
              <TrendingUp size={10} />Opportunities
            </p>
            <div className="space-y-2">
              {demoData.opportunities.map(opp => (
                <motion.button
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full bg-surface border border-accent/25 rounded-lg p-3 flex items-center justify-between text-left hover:border-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium">{opp.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{opp.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {opp.amount && <p className="text-accent font-medium text-sm">{formatCurrency(opp.amount)}</p>}
                    <div className="flex items-center gap-1 text-[9px] text-accent border border-accent/30 px-2 py-0.5 rounded">
                      Full Intel <ChevronRight size={10} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Next 3 Moves */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Next Moves</p>
          <div className="space-y-2">
            {demoData.nextMoves.map(move => (
              <button
                key={move.order}
                onClick={() => setSelectedMove(move)}
                className="w-full bg-surface border border-border rounded-lg p-3 text-left hover:border-accent/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-accent font-serif text-lg leading-none mt-0.5 flex-shrink-0">{move.order}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium">{move.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{move.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-text-muted group-hover:text-accent border border-border group-hover:border-accent/30 px-2 py-0.5 rounded transition-colors flex-shrink-0 mt-0.5">
                    Execution <ChevronRight size={10} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reminders */}
        {reminders.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Reminders</p>
            <div className="space-y-2">
              {reminders.slice(0, 4).map(rem => (
                <div key={rem.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <button onClick={() => completeReminder(rem.id)} className="mt-0.5 flex-shrink-0 text-text-muted hover:text-accent transition-colors">
                    <Circle size={14} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{rem.title}</p>
                    {rem.due_at && <p className="text-[10px] text-text-muted mt-0.5">{formatRelativeTime(rem.due_at)}</p>}
                  </div>
                  <StatusBadge status={rem.priority} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Condition */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Emotional Condition</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setEmotionalState(opt.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg border text-sm transition-all duration-150',
                  emotionalState === opt.value ? 'border-accent/60 bg-accent/10 text-accent' : 'border-border text-text-muted hover:text-text-secondary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {emotionalState && (
            <p className="text-xs text-text-muted mt-2">Logged: <span className="text-accent capitalize">{emotionalState}</span></p>
          )}
        </div>

        {/* Daily Affirmation */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Daily Affirmation</p>
          <button
            onClick={() => setAffirmationExpanded(!affirmationExpanded)}
            className="w-full bg-surface border border-accent/15 rounded-xl p-5 text-left hover:border-accent/30 transition-colors"
          >
            <p className={clsx('text-sm text-text-secondary leading-relaxed italic transition-all', !affirmationExpanded && 'line-clamp-3')}>
              "{AFFIRMATION}"
            </p>
            <p className="text-[10px] text-accent mt-3 uppercase tracking-wider">
              {affirmationExpanded ? 'Close' : 'Read full'}
            </p>
          </button>
        </div>

        {/* Offline Packet */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Survival Packet</p>
          <OfflinePacket offlineData={offlineData} isOffline={isOffline} lastSynced={lastSynced} />
        </div>

        {/* Nearby Connections */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Nearby Connections</p>
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <MapPin size={10} />
              <span>Philadelphia, PA</span>
            </div>
          </div>
          <div className="space-y-2">
            {NEARBY_FOUNDERS.map(f => (
              <div key={f.id} className="bg-surface border border-border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text-primary font-medium truncate">{f.name}</p>
                      <span className={clsx('text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium flex-shrink-0',
                        f.status === 'hot' ? 'bg-accent/15 text-accent' : 'bg-green-500/15 text-green-400'
                      )}>{f.status}</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5 truncate">{f.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-text-muted flex items-center gap-1"><MapPin size={8} />{f.distance}</span>
                      <span className="text-[10px] text-text-muted">{f.mutual} mutual</span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 px-2.5 py-1 border border-border rounded text-[10px] text-text-muted hover:border-accent/40 hover:text-accent transition-colors">
                    Connect
                  </button>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {f.tags.map(tag => (
                    <span key={tag} className="text-[9px] text-text-muted border border-border px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Opportunity Modal — Full Intel Package */}
      <AnimatePresence>
        {selectedOpp && oppIntel && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedOpp(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[88vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-6 pt-6 pb-4 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-accent mb-1">Full Intel — Opportunity</p>
                    <p className="text-lg font-medium text-text-primary leading-tight">{selectedOpp.title}</p>
                    {selectedOpp.amount && (
                      <p className="text-accent font-medium text-xl mt-1">{formatCurrency(selectedOpp.amount)}</p>
                    )}
                  </div>
                  <button onClick={() => setSelectedOpp(null)} className="text-text-muted hover:text-text-primary p-1 transition-colors ml-3 mt-0.5">
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-accent/10 border border-accent/25 text-accent text-[10px] px-3 py-1 rounded-full">
                  {oppIntel.timeline}
                </div>
              </div>

              <div className="px-6 pb-8 pt-4 space-y-5">
                {/* Contacts */}
                {oppIntel.contacts.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Contacts</p>
                    <div className="space-y-2">
                      {oppIntel.contacts.map((c, i) => (
                        <div key={i} className="bg-surface border border-border rounded-xl p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-text-primary font-medium">{c.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">{c.role}</p>
                            </div>
                            <div className="flex gap-2 ml-3">
                              {c.phone && (
                                <a href={`tel:${c.phone.replace(/\D/g, '')}`} className="w-7 h-7 bg-surface-2 rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-colors">
                                  <Phone size={12} />
                                </a>
                              )}
                              {c.email && c.email.trim() && (
                                <a href={`mailto:${c.email}`} className="w-7 h-7 bg-surface-2 rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-colors">
                                  <Mail size={12} />
                                </a>
                              )}
                              {c.link && (
                                <a href={c.link} target="_blank" rel="noopener noreferrer" className="w-7 h-7 bg-surface-2 rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-colors">
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                          {c.phone && <p className="text-xs text-text-muted mt-1">{c.phone}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {oppIntel.docs.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
                      <FileText size={10} />Documents Needed
                    </p>
                    <div className="space-y-1.5">
                      {oppIntel.docs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-surface border border-border rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                          <p className="text-xs text-text-secondary">{doc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Execution Steps</p>
                  <div className="space-y-2">
                    {oppIntel.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-surface border border-border rounded-lg">
                        <span className="text-accent text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-xs text-text-secondary leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scripts */}
                {oppIntel.scripts.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Scripts</p>
                    <div className="space-y-2">
                      {oppIntel.scripts.map((script, i) => (
                        <ScriptCard key={i} type={script.type} content={script.content} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Next Move Modal — Full Execution Package */}
      <AnimatePresence>
        {selectedMove && moveIntel && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedMove(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[88vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-6 pt-6 pb-4 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Move {selectedMove.order} — Full Package</p>
                    <p className="text-lg font-medium text-text-primary leading-tight">{selectedMove.title}</p>
                  </div>
                  <button onClick={() => setSelectedMove(null)} className="text-text-muted hover:text-text-primary p-1 transition-colors ml-3 mt-0.5">
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-crisis/10 border border-crisis/25 text-crisis text-[10px] px-3 py-1 rounded-full">
                  Deadline: {moveIntel.deadline}
                </div>
              </div>

              <div className="px-6 pb-8 pt-4 space-y-5">
                {/* Why This, Why Now */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Why This, Why Now</p>
                  <p className="text-xs text-text-secondary leading-relaxed border-l-2 border-accent/40 pl-3 bg-surface rounded-r-lg py-3 pr-3">
                    {moveIntel.why}
                  </p>
                </div>

                {/* Contacts */}
                {moveIntel.contacts.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Contacts</p>
                    <div className="space-y-2">
                      {moveIntel.contacts.map((c, i) => (
                        <div key={i} className="bg-surface border border-border rounded-xl p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-text-primary font-medium">{c.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">{c.role}</p>
                              {c.phone && <p className="text-xs text-text-muted mt-0.5">{c.phone}</p>}
                            </div>
                            <div className="flex gap-2 ml-3">
                              {c.phone && (
                                <a href={`tel:${c.phone.replace(/\D/g, '')}`} className="w-7 h-7 bg-surface-2 rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-colors">
                                  <Phone size={12} />
                                </a>
                              )}
                              {c.email && c.email.trim() && (
                                <a href={`mailto:${c.email}`} className="w-7 h-7 bg-surface-2 rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-colors">
                                  <Mail size={12} />
                                </a>
                              )}
                              {c.link && (
                                <a href={c.link} target="_blank" rel="noopener noreferrer" className="w-7 h-7 bg-surface-2 rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-colors">
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Steps to Completion</p>
                  <div className="space-y-2">
                    {moveIntel.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-surface border border-border rounded-lg">
                        <span className="text-accent text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-xs text-text-secondary leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scripts */}
                {moveIntel.scripts.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Scripts</p>
                    <div className="space-y-2">
                      {moveIntel.scripts.map((script, i) => (
                        <ScriptCard key={i} type={script.type} content={script.content} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {moveIntel.docs.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
                      <FileText size={10} />Documents Needed
                    </p>
                    <div className="space-y-1.5">
                      {moveIntel.docs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-surface border border-border rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                          <p className="text-xs text-text-secondary">{doc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success */}
                <div className="bg-green-400/5 border border-green-400/20 rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-wider text-green-400 mb-1.5">Success Looks Like</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{moveIntel.success}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
