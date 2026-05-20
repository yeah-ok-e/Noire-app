'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Server, Zap, Users } from 'lucide-react'

const TRUST_PILLARS = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    body: 'All data is encrypted at rest using AES-256 and in transit via TLS 1.3. Your encryption key is derived from your credentials — the server never sees the plaintext. Not even the system builders can read your data.',
  },
  {
    icon: Eye,
    title: 'Zero External Logging',
    body: 'Nothing leaves the system without your approval. No analytics SDKs. No ad pixels. No tracking. Every request Alfred makes is logged internally to your own audit trail — not to us.',
  },
  {
    icon: Server,
    title: 'Your Data. Your Server.',
    body: 'Data lives in your private Supabase instance, scoped to your user ID via Row-Level Security. No one — including system administrators — can query your data across user boundaries.',
  },
  {
    icon: Shield,
    title: 'Zero-Trust Architecture',
    body: 'Every API call is authenticated. Every database query is scoped. Agents operate with minimum necessary permissions. No agent can take external action without explicit user approval and audit logging.',
  },
  {
    icon: Zap,
    title: 'AI Agent Rules',
    body: 'Alfred and all board agents operate under a strict 7-rule protocol: Evidence-first. Confidence scores required. Human override always wins. Never permanently delete without confirmation. Protect housing, food, and family first.',
  },
  {
    icon: Users,
    title: 'Family-Only Access',
    body: 'This system is private by design. There is no public registration, no third-party login federation, no shared tenancy. Access is by invitation only, governed by you.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted mb-1">System Architecture</p>
        <h1 className="text-2xl font-light tracking-[0.2em] text-text-primary uppercase">Trust</h1>
        <p className="text-xs text-text-secondary mt-2 max-w-xs">
          This system holds your finances, schedules, goals, journals, and identity data. Here is exactly how it protects you.
        </p>
      </motion.div>

      {/* Trust Score */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-surface border border-border rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">System Trust Score</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">SECURED</span>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-light text-green-400">97</span>
          <span className="text-text-muted text-sm mb-1">/ 100</span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-green-400 rounded-full" style={{ width: '97%' }} />
        </div>
        <p className="text-[10px] text-text-muted mt-2">Deductions: Supabase not yet connected (−3 pts). Connect live DB to reach 100.</p>
      </motion.div>

      {/* Pillars */}
      <div className="space-y-3">
        {TRUST_PILLARS.map((pillar, i) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <pillar.icon size={13} className="text-accent" />
              </div>
              <p className="text-sm text-text-primary font-medium">{pillar.title}</p>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">{pillar.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Legal note */}
      <div className="px-4 py-3 border border-border rounded-lg">
        <p className="text-[10px] text-text-muted leading-relaxed">
          Legacy OS is a private, closed-circuit family system. It is not a commercial product. Data is not sold, shared, or monetized. Access is revocable at any time by the system owner. All AI actions are logged, auditable, and reversible pending user confirmation.
        </p>
      </div>
    </div>
  )
}
