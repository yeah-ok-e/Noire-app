'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, ExternalLink, Copy, Check, Database, Shield, Zap } from 'lucide-react'
import { clsx } from 'clsx'

const STEPS = [
  {
    id: 1,
    title: 'Create Supabase Project',
    description: 'Go to supabase.com → New Project. Name it "legacy-os". Choose a strong database password and save it.',
    action: 'Open Supabase',
    actionType: 'link' as const,
  },
  {
    id: 2,
    title: 'Copy Your Project Credentials',
    description: 'In your Supabase project → Settings → API. Copy the Project URL and the anon/public key.',
    action: null,
    actionType: null,
  },
  {
    id: 3,
    title: 'Add Env Vars to Vercel',
    description: 'In your Vercel project → Settings → Environment Variables. Add both values below, then redeploy.',
    action: null,
    actionType: 'vars' as const,
  },
  {
    id: 4,
    title: 'Run Database Schema',
    description: 'In Supabase → SQL Editor → paste the schema below and run it. This creates all 13 tables with encryption and row-level security.',
    action: null,
    actionType: 'schema' as const,
  },
  {
    id: 5,
    title: 'Create Your Account',
    description: 'In Supabase → Authentication → Users → Invite User. Use your email. Then sign in on the login page.',
    action: null,
    actionType: null,
  },
]

const ENV_VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://YOUR_PROJECT_REF.supabase.co', hint: 'From Supabase → Settings → API → Project URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbGc...', hint: 'From Supabase → Settings → API → anon public key' },
  { key: 'ANTHROPIC_API_KEY', value: 'sk-ant-...', hint: 'From console.anthropic.com — powers Alfred AI (optional)' },
]

const SCHEMA_SNIPPET = `-- Paste the full schema from:
-- /supabase/migrations/001_initial_schema.sql
-- in your repository, then run it in Supabase SQL Editor.
--
-- Creates: profiles, cash_updates, bills, noire_leads,
-- noire_transactions, journal_entries, adherence_logs,
-- goals, goal_transactions, body_logs, artifacts,
-- alfred_directives, audit_logs
--
-- All tables: RLS enabled, scoped to auth.uid()`

export default function SetupPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const toggleStep = (id: number) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const allDone = completed.size === STEPS.length

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted mb-1">Infrastructure</p>
        <h1 className="text-2xl font-light tracking-[0.2em] text-text-primary uppercase">Database Setup</h1>
        <p className="text-xs text-text-secondary mt-2">Connect Supabase to activate live sync, persistent data, and real authentication.</p>
      </motion.div>

      {/* Status bar */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Progress</p>
          <span className={clsx('text-xs font-medium', allDone ? 'text-green-400' : 'text-accent')}>{completed.size} / {STEPS.length}</span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            className={clsx('h-full rounded-full', allDone ? 'bg-green-400' : 'bg-accent')}
            animate={{ width: `${(completed.size / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {allDone && (
          <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5">
            <CheckCircle size={12} />All steps complete — redeploy Vercel to go live.
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className={clsx('bg-surface border rounded-xl p-4 transition-colors', completed.has(step.id) ? 'border-green-500/30' : 'border-border')}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(step.id)}
                className="mt-0.5 flex-shrink-0"
              >
                {completed.has(step.id)
                  ? <CheckCircle size={18} className="text-green-400" />
                  : <Circle size={18} className="text-text-muted" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] text-text-muted font-medium">{step.id}.</span>
                  <p className={clsx('text-sm font-medium', completed.has(step.id) ? 'text-text-secondary line-through' : 'text-text-primary')}>{step.title}</p>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">{step.description}</p>

                {/* Env vars display */}
                {step.actionType === 'vars' && (
                  <div className="mt-3 space-y-2">
                    {ENV_VARS.map(ev => (
                      <div key={ev.key} className="bg-surface-2 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-[10px] text-accent font-mono">{ev.key}</code>
                          <button
                            onClick={() => copyText(ev.key, ev.key)}
                            className="text-text-muted hover:text-accent transition-colors"
                          >
                            {copied === ev.key ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-text-muted">{ev.hint}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Schema snippet */}
                {step.actionType === 'schema' && (
                  <div className="mt-3 bg-surface-2 rounded-lg p-3 relative">
                    <button
                      onClick={() => copyText(SCHEMA_SNIPPET, 'schema')}
                      className="absolute top-2 right-2 text-text-muted hover:text-accent transition-colors"
                    >
                      {copied === 'schema' ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    </button>
                    <pre className="text-[10px] text-text-muted font-mono leading-relaxed whitespace-pre-wrap pr-6">{SCHEMA_SNIPPET}</pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* What you get */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">What Goes Live</p>
        {[
          { icon: Database, label: 'Real data sync', sub: '13 tables — money, Noire, journal, adherence, goals, body' },
          { icon: Shield, label: 'Row-level security', sub: 'Zero cross-user access. Your data, your server.' },
          { icon: Zap, label: 'Live auth', sub: 'Email + biometric login. Sessions persist across devices.' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Icon size={13} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-primary">{label}</p>
              <p className="text-[10px] text-text-muted">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
