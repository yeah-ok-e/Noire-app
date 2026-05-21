'use client'

import { useState, useRef } from 'react'
import { RotateCcw, Shield, Download, AlertCircle, CheckCircle, Activity, Plus, Search, Archive, FileText, Image, Film, Mic, Receipt, Trash2, Link2, RefreshCw, Lock, Upload } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import type { Artifact } from '@/types/database'

const DEMO_AUDIT_LOGS = [
  { id: 'log-1', action: 'UPDATE', resource_type: 'bills', previous_value: { status: 'pending' }, new_value: { status: 'overdue' }, performed_by: 'system', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'log-2', action: 'CREATE', resource_type: 'cash_updates', previous_value: null, new_value: { amount: 234 }, performed_by: 'user', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'log-3', action: 'UPDATE', resource_type: 'reminders', previous_value: { completed: false }, new_value: { completed: true }, performed_by: 'user', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-4', action: 'CREATE', resource_type: 'noire_leads', previous_value: null, new_value: { name: 'Keisha Events Co.' }, performed_by: 'user', created_at: new Date(Date.now() - 7200000).toISOString() },
]

const DEMO_ERROR_LOGS = [
  { id: 'err-1', error_type: 'SUPABASE_NOT_CONFIGURED', error_message: 'Running in demo mode — Supabase not connected', resolved: false, created_at: new Date().toISOString() },
]

const INTEGRATIONS = [
  { name: 'Supabase', status: 'demo', description: 'Database & Auth — connect to enable live sync' },
  { name: 'OpenAI', status: 'pending', description: 'AI recommendations — add API key to enable' },
  { name: 'Shopify', status: 'planned', description: 'Noire store integration — coming soon' },
  { name: 'Vercel', status: 'active', description: 'Deployment platform — connected' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  document: FileText, image: Image, video: Film, audio: Mic,
  receipt: Receipt, invoice: Receipt, screenshot: Image, default: Archive,
}

const TYPE_OPTIONS = [
  { value: 'document', label: 'Document' }, { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' }, { value: 'audio', label: 'Audio' },
  { value: 'screenshot', label: 'Screenshot' }, { value: 'receipt', label: 'Receipt' },
  { value: 'invoice', label: 'Invoice' }, { value: 'contract', label: 'Contract' },
  { value: 'form', label: 'Form' }, { value: 'note', label: 'Note' },
  { value: 'other', label: 'Other' },
]

const LINKED_ACCOUNTS = [
  {
    id: 'fidelity',
    name: 'Fidelity Investments',
    category: 'Brokerage & Retirement',
    type: 'investment',
    lastFour: '4821',
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 3 * 3600000).toISOString(),
    balance: '$12,440.00',
    note: 'Roth IRA + brokerage account',
    color: '#2e7d32',
  },
  {
    id: 'chase',
    name: 'Chase Bank',
    category: 'Checking & Savings',
    type: 'bank',
    lastFour: '7703',
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 1 * 3600000).toISOString(),
    balance: '$1,847.32',
    note: 'Primary checking — direct deposit',
    color: '#1565c0',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    category: 'Crypto Exchange',
    type: 'crypto',
    lastFour: null,
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 6 * 3600000).toISOString(),
    balance: '$340.17',
    note: 'BTC, ETH holdings',
    color: '#1652f0',
  },
  {
    id: 'kraken',
    name: 'Kraken',
    category: 'Crypto Exchange',
    type: 'crypto',
    lastFour: null,
    status: 'pending' as const,
    lastSync: null,
    balance: null,
    note: 'API key pending — add in settings',
    color: '#5741d9',
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    category: 'P2P Payments',
    type: 'payments',
    lastFour: null,
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 30 * 60000).toISOString(),
    balance: '$215.00',
    note: '$cashtag linked — Noire payments',
    color: '#00d632',
  },
]

const FOOTPRINT_SCAN = {
  lastScan: new Date(Date.now() - 2 * 3600000).toISOString(),
  score: 72, // lower = better (less exposed)
  exposures: [
    { id: 'fp1', type: 'email', value: 'e***h@gmail.com', source: 'Data broker — Spokeo', risk: 'medium', suppressed: false },
    { id: 'fp2', type: 'address', value: '******* St, Philadelphia PA', source: 'Whitepages', risk: 'high', suppressed: false },
    { id: 'fp3', type: 'phone', value: '+1 (215) ***-****', source: 'BeenVerified', risk: 'high', suppressed: true },
    { id: 'fp4', type: 'name+city', value: 'Eligah Lewis, Philadelphia', source: 'MyLife.com', risk: 'medium', suppressed: false },
    { id: 'fp5', type: 'social', value: '@yeah.ok.e — linked to real name', source: 'TruthFinder', risk: 'low', suppressed: false },
  ]
}

const REAL_GOALS = [
  {
    id: 'g1',
    label: 'Cash Reserve',
    target: 2000,
    unit: '$',
    description: 'Emergency buffer — 30 days covered',
    category: 'money',
    color: '#d4af7a',
    transactions: [
      { date: '2026-05-18', amount: 234, note: 'UC deposit — allocated to reserve' },
      { date: '2026-05-10', amount: 100, note: 'Cash App transfer to savings' },
      { date: '2026-05-03', amount: 50, note: 'Rolled over bill savings' },
    ],
  },
  {
    id: 'g2',
    label: 'Noire Revenue',
    target: 10000,
    unit: '$',
    description: 'Pressure Era milestone — first $10k',
    category: 'noire',
    color: '#a78bfa',
    transactions: [
      { date: '2026-05-19', amount: 215, note: 'Origin Series hoodie — 1 unit sold' },
      { date: '2026-05-12', amount: 195, note: 'Origin Series hoodie — 1 unit' },
      { date: '2026-05-01', amount: 195, note: 'Pre-order — hoodie' },
    ],
  },
  {
    id: 'g3',
    label: 'Debt Cleared',
    target: 3200,
    unit: '$',
    description: 'Total high-interest debt — eliminate',
    category: 'money',
    color: '#ef4444',
    transactions: [
      { date: '2026-05-15', amount: 80, note: 'ConEd partial payment' },
      { date: '2026-05-01', amount: 120, note: 'Rent arrears — partial' },
    ],
  },
  {
    id: 'g4',
    label: 'Noire Drops',
    target: 6,
    unit: 'drops',
    description: 'Drops completed in 2026',
    category: 'noire',
    color: '#22c55e',
    transactions: [
      { date: '2026-05-30', amount: 1, note: 'Origin Series Hoodie — LIVE' },
    ],
  },
]

const DEMO_ARTIFACTS: Partial<Artifact>[] = [
  { id: 'art-1', title: 'LIHEAP Application Copy', type: 'document', category: 'assistance', tags: ['liheap', 'utilities', 'assistance'], ai_summary: 'Energy assistance application — submitted. Appointment confirmed.', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'art-2', title: 'Meineke Fuel Pump Quote', type: 'receipt', category: 'car', tags: ['car', 'meineke', 'repair'], ai_summary: 'Fuel pump replacement quote — $980 parts + labor.', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'art-3', title: 'Noire Brand Guide v1', type: 'document', category: 'noire', tags: ['noire', 'brand', 'identity'], ai_summary: 'Core brand identity document — colors, fonts, tone, and visual language.', created_at: new Date(Date.now() - 14 * 86400000).toISOString(), updated_at: new Date().toISOString() },
]

export default function AdminPage() {
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS)
  const [activeTab, setActiveTab] = useState<'audit' | 'errors' | 'permissions' | 'ai' | 'artifacts' | 'connections' | 'footprint' | 'goals'>('audit')
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null)
  const [rolledBack, setRolledBack] = useState<string[]>([])
  const [artifacts, setArtifacts] = useState<Partial<Artifact>[]>(DEMO_ARTIFACTS)
  const [artifactSearch, setArtifactSearch] = useState('')
  const [artifactFilter, setArtifactFilter] = useState('')
  const [addArtifact, setAddArtifact] = useState(false)
  const [detailArtifact, setDetailArtifact] = useState<Partial<Artifact> | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [exposures, setExposures] = useState(FOOTPRINT_SCAN.exposures)

  const handleExport = () => {
    const data = { exported_at: new Date().toISOString(), audit_logs: auditLogs, note: 'LEGACY OS data export — demo mode' }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legacy-os-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddArtifact = () => {
    if (!newTitle.trim()) return
    setArtifacts(prev => [...prev, { id: `art-${Date.now()}`, title: newTitle, type: (newType as Artifact['type']) || 'document', tags: newTags ? newTags.split(',').map(t => t.trim()) : [], ai_summary: newSummary || null, category: null, storage_path: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    setNewTitle(''); setNewType(''); setNewTags(''); setNewSummary('')
    setAddArtifact(false)
  }

  const handleDeleteArtifact = (id: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== id))
    setDeleteConfirm(null)
    if (detailArtifact?.id === id) setDetailArtifact(null)
  }

  const filteredArtifacts = artifacts.filter(a => {
    const matchSearch = !artifactSearch || (
      a.title?.toLowerCase().includes(artifactSearch.toLowerCase()) ||
      a.ai_summary?.toLowerCase().includes(artifactSearch.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(artifactSearch.toLowerCase()))
    )
    const matchType = !artifactFilter || a.type === artifactFilter
    return matchSearch && matchType
  })

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Demo Mode Notice */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3">
        <p className="text-xs text-accent font-medium">Demo Mode Active</p>
        <p className="text-[10px] text-text-muted mt-0.5">Connect Supabase to enable live sync, persistent data, and full audit logging.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href="/setup" className="flex items-center justify-between px-3 py-3 bg-surface border border-accent/30 rounded-lg hover:border-accent/60 transition-colors group">
          <p className="text-xs text-accent group-hover:text-accent transition-colors">Connect Database →</p>
        </a>
        <a href="/privacy" className="flex items-center justify-between px-3 py-3 bg-surface border border-border rounded-lg hover:border-accent/40 transition-colors group">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs text-text-secondary group-hover:text-accent transition-colors">Trust Architecture</p>
          </div>
        </a>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Database', status: 'demo', icon: Activity },
          { label: 'Auth', status: 'demo', icon: Shield },
          { label: 'Storage', status: 'pending', icon: Download },
          { label: 'AI System', status: 'pending', icon: CheckCircle },
        ].map(({ label, status, icon: Icon }) => (
          <div key={label} className="bg-surface border border-border rounded-lg px-3 py-3 flex items-center gap-2">
            <Icon size={14} className={status === 'active' ? 'text-green-400' : status === 'demo' ? 'text-accent' : 'text-text-muted'} />
            <div>
              <p className="text-xs text-text-primary">{label}</p>
              <p className={clsx('text-[9px] uppercase tracking-wider', status === 'active' ? 'text-green-400' : status === 'demo' ? 'text-accent' : 'text-text-muted')}>{status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Export */}
      <button onClick={handleExport} className="w-full flex items-center justify-between px-4 py-3 border border-border rounded-lg text-sm text-text-muted hover:border-accent/40 hover:text-accent transition-all">
        <span>Export Data as JSON</span>
        <Download size={14} />
      </button>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none">
        {(['audit', 'errors', 'permissions', 'ai', 'artifacts', 'connections', 'footprint', 'goals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx('flex-shrink-0 px-4 py-2.5 text-xs uppercase tracking-widest transition-colors', activeTab === tab ? 'text-accent border-b-2 border-accent' : 'text-text-muted')}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">{auditLogs.length} logged actions</p>
          {auditLogs.map(log => (
            <div key={log.id} className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className={clsx('text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium',
                  log.action === 'CREATE' ? 'bg-green-500/15 text-green-400' :
                  log.action === 'UPDATE' ? 'bg-yellow-500/15 text-yellow-400' :
                  'bg-crisis/15 text-crisis'
                )}>{log.action}</span>
                <span className="text-xs text-text-secondary">{log.resource_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-text-muted mb-2">
                <span>By: {log.performed_by}</span>
                <span>{formatRelativeTime(log.created_at)}</span>
              </div>
              {log.previous_value && <div className="mb-1 p-2 bg-surface-2 rounded text-[10px] text-text-muted font-mono"><span className="text-crisis">before: </span>{JSON.stringify(log.previous_value)}</div>}
              {log.new_value && <div className="p-2 bg-surface-2 rounded text-[10px] text-text-muted font-mono"><span className="text-green-400">after: </span>{JSON.stringify(log.new_value)}</div>}
              {log.previous_value && !rolledBack.includes(log.id) && (
                <button onClick={() => setRolledBack(prev => [...prev, log.id])} className="mt-2 flex items-center gap-1 text-[10px] text-text-muted hover:text-accent transition-colors">
                  <RotateCcw size={10} />Rollback
                </button>
              )}
              {rolledBack.includes(log.id) && (
                <p className="mt-2 text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10} />Rolled back</p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="space-y-2">
          {DEMO_ERROR_LOGS.map(err => (
            <div key={err.id} className="bg-surface border border-crisis/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-crisis flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-primary font-medium">{err.error_type}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">{err.error_message}</p>
                  <p className="text-[10px] text-text-muted mt-1">{formatRelativeTime(err.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Integrations</p>
          {INTEGRATIONS.map(int => (
            <div key={int.name} className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary font-medium">{int.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{int.description}</p>
              </div>
              <StatusBadge status={int.status} />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-4">
          <Card variant="glass" className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-3">AI Controls</p>
            <div className="space-y-3">
              {[
                { label: 'AI Autonomy', description: 'Allow AI to take actions automatically', enabled: false },
                { label: 'Simulation Mode', description: 'Test AI suggestions without saving', enabled: true },
                { label: 'Approval Required', description: 'All AI actions require user approval', enabled: true },
              ].map(control => (
                <div key={control.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-primary">{control.label}</p>
                    <p className="text-[10px] text-text-muted">{control.description}</p>
                  </div>
                  <div className={clsx('w-8 h-4 rounded-full transition-colors', control.enabled ? 'bg-accent' : 'bg-surface-3')}>
                    <div className={clsx('w-3 h-3 rounded-full bg-white mt-0.5 transition-transform', control.enabled ? 'translate-x-4' : 'translate-x-0.5')} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Token Budget</p>
            <div className="flex justify-between items-center">
              <div className="flex-1 bg-surface-2 rounded-full h-2 mr-3">
                <div className="bg-accent rounded-full h-2 w-[15%]" />
              </div>
              <span className="text-xs text-text-secondary">~1,500 / 10,000</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Agent Rules</p>
            <div className="space-y-1.5">
              {[
                'No external action without user approval',
                'Evidence-first recommendations only',
                'Confidence scores required on all outputs',
                'Protect housing, food, communication first',
                'Human always overrides system',
                'Log every AI action to audit trail',
                'Never permanently delete without confirmation',
              ].map((rule, i) => (
                <p key={i} className="text-[10px] text-text-muted flex items-start gap-2">
                  <span className="text-accent flex-shrink-0">{i + 1}.</span>{rule}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">{LINKED_ACCOUNTS.length} accounts</p>
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <Lock size={10} />
              <span>E2E Encrypted</span>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3">
            <p className="text-xs text-accent font-medium">Secure Read-Only Connections</p>
            <p className="text-[10px] text-text-muted mt-0.5">All account credentials are encrypted at rest. Legacy OS never stores passwords — only read tokens.</p>
          </div>

          <div className="space-y-2">
            {LINKED_ACCOUNTS.map(account => (
              <div key={account.id} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: account.color + '22', border: `1px solid ${account.color}44` }}>
                      <Link2 size={14} style={{ color: account.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-text-primary font-medium truncate">{account.name}</p>
                        {account.lastFour && <span className="text-[10px] text-text-muted">···{account.lastFour}</span>}
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">{account.category}</p>
                      {account.note && <p className="text-[10px] text-text-muted/70 mt-0.5 italic">{account.note}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={clsx('text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium',
                      account.status === 'connected' ? 'bg-green-500/15 text-green-400' :
                      account.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-crisis/15 text-crisis'
                    )}>{account.status}</span>
                    {account.balance && (
                      <p className="text-sm font-medium text-text-primary">{account.balance}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-text-muted">
                    {account.lastSync ? (() => {
                      const diffMs = Date.now() - new Date(account.lastSync).getTime()
                      const hrs = Math.floor(diffMs / 3600000)
                      const mins = Math.floor(diffMs / 60000)
                      return hrs >= 1 ? `Synced ${hrs}hr ago` : `Synced ${mins}min ago`
                    })() : 'Not synced yet'}
                  </p>
                  <button
                    onClick={() => {
                      setSyncingAccount(account.id)
                      setTimeout(() => setSyncingAccount(null), 1500)
                    }}
                    className={clsx('flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-colors',
                      account.status === 'connected'
                        ? 'border-border text-text-muted hover:border-accent/40 hover:text-accent'
                        : 'border-accent/40 text-accent hover:bg-accent/10'
                    )}
                  >
                    <RefreshCw size={10} className={syncingAccount === account.id ? 'animate-spin' : ''} />
                    {account.status === 'connected' ? 'Sync' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Add Account</p>
            <p className="text-[11px] text-text-secondary">Connect additional accounts via Plaid, direct API keys, or OAuth. All connections are zero-trust — read-only by default.</p>
            <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-xs text-text-muted hover:border-accent/40 hover:text-accent transition-colors">
              <Plus size={12} />Connect New Account
            </button>
          </div>
        </div>
      )}

      {activeTab === 'footprint' && (
        <div className="space-y-5">
          {/* Score Circle */}
          <div className="flex flex-col items-center py-6">
            <div className={clsx(
              'w-28 h-28 rounded-full flex flex-col items-center justify-center border-4',
              FOOTPRINT_SCAN.score > 70 ? 'border-crisis bg-crisis/10' :
              FOOTPRINT_SCAN.score > 40 ? 'border-yellow-400 bg-yellow-400/10' :
              'border-green-400 bg-green-400/10'
            )}>
              <span className={clsx(
                'text-3xl font-bold',
                FOOTPRINT_SCAN.score > 70 ? 'text-crisis' :
                FOOTPRINT_SCAN.score > 40 ? 'text-yellow-400' :
                'text-green-400'
              )}>{FOOTPRINT_SCAN.score}</span>
              <span className="text-[9px] uppercase tracking-widest text-text-muted mt-0.5">Exposure</span>
            </div>
            <p className="text-[10px] text-text-muted mt-3">Last scan: {formatRelativeTime(FOOTPRINT_SCAN.lastScan)}</p>
            <p className="text-[10px] text-text-muted/60 mt-0.5">Lower score = less exposed</p>
            <button
              onClick={() => { setScanning(true); setTimeout(() => setScanning(false), 2000) }}
              className={clsx(
                'mt-4 px-5 py-2 rounded-lg border text-xs font-medium transition-all',
                scanning ? 'border-accent/40 text-accent animate-pulse' : 'border-border text-text-secondary hover:border-accent/40 hover:text-accent'
              )}
            >
              {scanning ? 'Scanning...' : 'Run Scan'}
            </button>
          </div>

          {/* Exposures List */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">{exposures.length} exposures detected</p>
            <div className="space-y-2">
              {exposures.map(exp => (
                <div key={exp.id} className={clsx('bg-surface border rounded-lg p-3', exp.suppressed ? 'border-border opacity-60' : 'border-border')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted uppercase tracking-wider">{exp.type}</span>
                        <span className={clsx('text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium',
                          exp.risk === 'high' ? 'bg-crisis/15 text-crisis' :
                          exp.risk === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
                          'text-text-muted'
                        )}>{exp.risk}</span>
                        {exp.suppressed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 uppercase tracking-wider">Suppressed</span>
                        )}
                      </div>
                      <p className={clsx('text-sm text-text-primary font-mono', exp.suppressed && 'line-through')}>{exp.value}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{exp.source}</p>
                    </div>
                    {!exp.suppressed && (
                      <button
                        onClick={() => setExposures(prev => prev.map(e => e.id === exp.id ? { ...e, suppressed: true } : e))}
                        className="flex-shrink-0 text-[10px] px-2 py-1 rounded border border-border text-text-muted hover:border-accent/40 hover:text-accent transition-colors"
                      >
                        Suppress
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-surface border border-border rounded-lg px-4 py-3">
            <p className="text-[11px] text-text-secondary leading-relaxed">Alfred&apos;s <span className="text-accent font-medium">SENTINEL</span> agent continuously monitors for new exposures. Suppression requests are queued and processed within 48–72 hours.</p>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Actual Transactional Progress</p>
          <p className="text-xs text-text-secondary">Every bar moves only when a real transaction is logged. No theory.</p>

          <div className="space-y-4">
            {REAL_GOALS.map(goal => {
              const total = goal.transactions.reduce((s, t) => s + t.amount, 0)
              const pct = Math.min(Math.round((total / goal.target) * 100), 100)
              return (
                <div key={goal.id} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-text-primary font-medium">{goal.label}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{goal.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium" style={{ color: goal.color }}>
                        {goal.unit === '$' ? `$${total.toLocaleString()}` : `${total} ${goal.unit}`}
                      </p>
                      <p className="text-[10px] text-text-muted">of {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target} ${goal.unit}`}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-text-muted">{pct}% complete</span>
                    <span className="text-[10px]" style={{ color: goal.color }}>
                      {goal.unit === '$' ? `$${(goal.target - total).toLocaleString()} to go` : `${goal.target - total} to go`}
                    </span>
                  </div>

                  {/* Transaction log */}
                  <div className="space-y-1.5 border-t border-border pt-3">
                    <p className="text-[9px] uppercase tracking-wider text-text-muted mb-2">Transaction Log</p>
                    {goal.transactions.map((tx, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-text-secondary truncate">{tx.note}</p>
                          <p className="text-[9px] text-text-muted">{tx.date}</p>
                        </div>
                        <span className="text-[10px] font-medium ml-2 flex-shrink-0" style={{ color: goal.color }}>
                          +{goal.unit === '$' ? `$${tx.amount}` : `${tx.amount} ${goal.unit}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'artifacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">{artifacts.length} artifacts</p>
            <button onClick={() => setAddArtifact(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-all">
              <Plus size={12} />Upload
            </button>
          </div>

          {/* Drag-Drop Document AI Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setIsDragging(false)
              const files = Array.from(e.dataTransfer.files)
              if (files.length > 0) {
                setAiProcessing(true)
                setTimeout(() => {
                  const f = files[0]
                  setArtifacts(prev => [...prev, {
                    id: `art-${Date.now()}`,
                    title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
                    type: f.type.startsWith('image') ? 'image' : f.type.includes('pdf') ? 'document' : 'document',
                    tags: ['uploaded', 'ai-processed'],
                    ai_summary: `AI-processed: ${f.name}. Document analyzed and categorized automatically.`,
                    category: null, storage_path: null,
                    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                  }])
                  setAiProcessing(false)
                }, 2000)
              }
            }}
            className={clsx('border-2 border-dashed rounded-lg p-6 text-center transition-all mb-4', isDragging ? 'border-accent bg-accent/5' : 'border-border')}
          >
            {aiProcessing ? (
              <p className="text-accent text-xs animate-pulse">AI processing document...</p>
            ) : (
              <>
                <Upload size={20} className="text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">Drop a document here for AI analysis</p>
                <p className="text-[10px] text-text-muted/60 mt-1">Receipt, contract, form, or photo — auto-tagged &amp; summarized</p>
              </>
            )}
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={artifactSearch}
                onChange={e => setArtifactSearch(e.target.value)}
                placeholder="Search artifacts..."
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors"
              />
            </div>
            <select
              value={artifactFilter}
              onChange={e => setArtifactFilter(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-accent/60 transition-colors"
            >
              <option value="">All</option>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Artifacts List */}
          <div className="space-y-2">
            {filteredArtifacts.length === 0 ? (
              <div className="p-6 text-center">
                <Archive size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">No artifacts found.</p>
              </div>
            ) : (
              filteredArtifacts.map(artifact => {
                const Icon = TYPE_ICONS[artifact.type || 'default'] || TYPE_ICONS.default
                return (
                  <motion.button
                    key={artifact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setDetailArtifact(artifact)}
                    className="w-full bg-surface border border-border rounded-lg p-3 text-left hover:border-border transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-surface-2 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-medium truncate">{artifact.title}</p>
                        {artifact.ai_summary && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{artifact.ai_summary}</p>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {artifact.type && <StatusBadge status={artifact.type} />}
                          {artifact.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted flex-shrink-0">{formatRelativeTime(artifact.created_at)}</p>
                    </div>
                  </motion.button>
                )
              })
            )}
          </div>

          {/* Add Artifact Modal */}
          <Modal isOpen={addArtifact} onClose={() => setAddArtifact(false)} title="Add Artifact">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Title</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Document title" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:border-accent/60 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-accent/60 transition-colors">
                  <option value="">Select type</option>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Tags (comma-separated)</label>
                <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="rent, legal, 2025" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:border-accent/60 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Summary</label>
                <textarea value={newSummary} onChange={e => setNewSummary(e.target.value)} placeholder="Brief description..." rows={2} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:border-accent/60 transition-colors resize-none" />
              </div>
              <p className="text-xs text-text-muted">File upload available when Supabase Storage is connected.</p>
              <div className="flex gap-3">
                <button onClick={() => setAddArtifact(false)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">Cancel</button>
                <button onClick={handleAddArtifact} className="flex-1 py-2.5 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors">Add Artifact</button>
              </div>
            </div>
          </Modal>

          {/* Detail Modal */}
          <Modal isOpen={!!detailArtifact} onClose={() => setDetailArtifact(null)} title={detailArtifact?.title}>
            {detailArtifact && (
              <div className="space-y-4">
                {detailArtifact.type && <div><p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Type</p><StatusBadge status={detailArtifact.type} /></div>}
                {detailArtifact.ai_summary && <div><p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Summary</p><p className="text-sm text-text-secondary">{detailArtifact.ai_summary}</p></div>}
                {detailArtifact.tags && detailArtifact.tags.length > 0 && (
                  <div><p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailArtifact.tags.map(tag => <span key={tag} className="text-xs text-text-muted border border-border px-2 py-0.5 rounded">{tag}</span>)}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2 border-t border-border">
                  <button className="flex-1 py-2 rounded-lg border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5">
                    <Download size={13} />Download
                  </button>
                  <button onClick={() => setDeleteConfirm(detailArtifact.id || null)} className="py-2 px-4 rounded-lg border border-crisis/40 text-crisis text-sm hover:bg-crisis/10 transition-colors flex items-center gap-1.5">
                    <Trash2 size={13} />Delete
                  </button>
                </div>
                {deleteConfirm === detailArtifact.id && (
                  <div className="bg-crisis/10 border border-crisis/30 rounded-lg p-3">
                    <p className="text-crisis text-sm mb-3">Delete this artifact permanently?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg border border-border text-text-secondary text-xs">Cancel</button>
                      <button onClick={() => handleDeleteArtifact(detailArtifact.id!)} className="flex-1 py-2 rounded-lg bg-crisis/20 border border-crisis text-crisis text-xs font-medium">Confirm Delete</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  )
}
