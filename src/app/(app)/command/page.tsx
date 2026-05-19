'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, CheckCircle, Circle, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CrisisBanner } from '@/components/modules/CrisisMode'
import { OfflinePacket } from '@/components/modules/OfflinePacket'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { useCrisisMode } from '@/lib/hooks/useCrisisMode'
import { useOffline } from '@/lib/hooks/useOffline'
import { formatCurrency, formatShortDate, formatRelativeTime } from '@/lib/utils/formatters'
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

export default function CommandPage() {
  const { demoData, store, getCurrentCash, completeReminder } = useDemoMode()
  const { isOffline, lastSynced, offlineData } = useOffline()
  const [emotionalState, setEmotionalState] = useState<string | null>(null)
  const [checked, setChecked] = useState<string[]>([])

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

  return (
    <div>
      <CrisisBanner isCrisis={isCrisis} reasons={reasons} />

      <div className="px-4 py-6 space-y-5">
        {/* 5 Non-Negotiables */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1.5">
              <CheckCircle size={10} />
              5 Non-Negotiables
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
                  checked.includes(nn.id)
                    ? 'border-accent/30 bg-accent/5'
                    : 'border-border bg-surface'
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

        {/* Status Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted">
              {format(new Date(), 'EEEE')}
            </p>
            <p className="text-text-secondary text-sm">
              {format(new Date(), 'MMMM d, yyyy')}
            </p>
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
            <span className={clsx('text-5xl font-light tracking-tight', cashColor)}>
              {formatCurrency(cashAmount)}
            </span>
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

        {/* Threats */}
        {demoData.threats.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-crisis mb-2 flex items-center gap-1.5">
              <AlertTriangle size={10} />
              Active Threats
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
                    {threat.amount && (
                      <p className="text-crisis font-medium text-sm">{formatCurrency(threat.amount)}</p>
                    )}
                    <StatusBadge status={threat.priority} className="mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {demoData.opportunities.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-accent mb-2 flex items-center gap-1.5">
              <TrendingUp size={10} />
              Opportunities
            </p>
            <div className="space-y-2">
              {demoData.opportunities.map(opp => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface border border-accent/25 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-text-primary font-medium">{opp.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{opp.description}</p>
                  </div>
                  {opp.amount && (
                    <p className="text-accent font-medium text-sm ml-3 flex-shrink-0">
                      {formatCurrency(opp.amount)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Next 3 Moves */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Next Moves</p>
          <div className="space-y-2">
            {demoData.nextMoves.map(move => (
              <Card key={move.order} variant="default" className="p-3">
                <div className="flex items-start gap-3">
                  <span className="text-accent font-serif text-lg leading-none mt-0.5 flex-shrink-0">
                    {move.order}
                  </span>
                  <div>
                    <p className="text-sm text-text-primary font-medium">{move.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{move.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-text-muted ml-auto flex-shrink-0 mt-0.5" />
                </div>
              </Card>
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
                  <button
                    onClick={() => completeReminder(rem.id)}
                    className="mt-0.5 flex-shrink-0 text-text-muted hover:text-accent transition-colors"
                  >
                    <Circle size={14} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{rem.title}</p>
                    {rem.due_at && (
                      <p className="text-[10px] text-text-muted mt-0.5">{formatRelativeTime(rem.due_at)}</p>
                    )}
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
                  emotionalState === opt.value
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-border text-text-muted hover:text-text-secondary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {emotionalState && (
            <p className="text-xs text-text-muted mt-2">
              Logged: <span className="text-accent capitalize">{emotionalState}</span>
            </p>
          )}
        </div>

        {/* Offline Packet */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Survival Packet</p>
          <OfflinePacket offlineData={offlineData} isOffline={isOffline} lastSynced={lastSynced} />
        </div>
      </div>
    </div>
  )
}
