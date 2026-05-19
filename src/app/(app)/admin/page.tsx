'use client'

import { useState, useRef } from 'react'
import { RotateCcw, Shield, Download, AlertCircle, CheckCircle, Activity, Plus, Search, Archive, FileText, Image, Film, Mic, Receipt, Trash2 } from 'lucide-react'
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

const DEMO_ARTIFACTS: Partial<Artifact>[] = [
  { id: 'art-1', title: 'LIHEAP Application Copy', type: 'document', category: 'assistance', tags: ['liheap', 'utilities', 'assistance'], ai_summary: 'Energy assistance application — submitted. Appointment confirmed.', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'art-2', title: 'Meineke Fuel Pump Quote', type: 'receipt', category: 'car', tags: ['car', 'meineke', 'repair'], ai_summary: 'Fuel pump replacement quote — $980 parts + labor.', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'art-3', title: 'Noire Brand Guide v1', type: 'document', category: 'noire', tags: ['noire', 'brand', 'identity'], ai_summary: 'Core brand identity document — colors, fonts, tone, and visual language.', created_at: new Date(Date.now() - 14 * 86400000).toISOString(), updated_at: new Date().toISOString() },
]

export default function AdminPage() {
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS)
  const [activeTab, setActiveTab] = useState<'audit' | 'errors' | 'permissions' | 'ai' | 'artifacts'>('audit')
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
        {(['audit', 'errors', 'permissions', 'ai', 'artifacts'] as const).map(tab => (
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

      {activeTab === 'artifacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">{artifacts.length} artifacts</p>
            <button onClick={() => setAddArtifact(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-all">
              <Plus size={12} />Upload
            </button>
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
