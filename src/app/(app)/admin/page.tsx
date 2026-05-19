'use client'
import { useState } from 'react'
import { RotateCcw, Shield, Download, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters'

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

export default function AdminPage() {
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS)
  const [activeTab, setActiveTab] = useState<'audit' | 'errors' | 'permissions' | 'ai'>('audit')
  const [rolledBack, setRolledBack] = useState<string[]>([])

  const handleRollback = (logId: string) => {
    setRolledBack(prev => [...prev, logId])
  }

  const handleExport = () => {
    const data = {
      exported_at: new Date().toISOString(),
      audit_logs: auditLogs,
      note: 'LEGACY OS data export — demo mode',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legacy-os-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Demo Mode Notice */}
      <div className="bg-[#d4af7a]/10 border border-[#d4af7a]/20 rounded-lg px-4 py-3">
        <p className="text-xs text-[#d4af7a] font-medium">Demo Mode Active</p>
        <p className="text-[10px] text-[#888] mt-0.5">Connect Supabase to enable live sync, persistent data, and full audit logging.</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Database', status: 'demo', icon: Activity },
          { label: 'Auth', status: 'demo', icon: Shield },
          { label: 'Storage', status: 'pending', icon: Download },
          { label: 'AI System', status: 'pending', icon: CheckCircle },
        ].map(({ label, status, icon: Icon }) => (
          <div key={label} className="bg-[#111] border border-[#222] rounded-lg px-3 py-3 flex items-center gap-2">
            <Icon size={14} className={status === 'active' ? 'text-green-400' : status === 'demo' ? 'text-[#d4af7a]' : 'text-[#444]'} />
            <div>
              <p className="text-xs text-[#f0ede8]">{label}</p>
              <p className={`text-[9px] uppercase tracking-wider ${status === 'active' ? 'text-green-400' : status === 'demo' ? 'text-[#d4af7a]' : 'text-[#444]'}`}>
                {status}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Export */}
      <button
        onClick={handleExport}
        className="w-full flex items-center justify-between px-4 py-3 border border-[#2a2a2a] rounded-lg text-sm text-[#888] hover:border-[#d4af7a]/40 hover:text-[#d4af7a] transition-all"
      >
        <span>Export Data as JSON</span>
        <Download size={14} />
      </button>

      {/* Tabs */}
      <div className="flex border-b border-[#1a1a1a] overflow-x-auto scrollbar-none">
        {(['audit', 'errors', 'permissions', 'ai'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2.5 text-xs uppercase tracking-widest transition-colors ${
              activeTab === tab ? 'text-[#d4af7a] border-b-2 border-[#d4af7a]' : 'text-[#444]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-[#444]">
            {auditLogs.length} logged actions
          </p>
          {auditLogs.map(log => (
            <div key={log.id} className="bg-[#111] border border-[#222] rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium ${
                      log.action === 'CREATE' ? 'bg-green-500/15 text-green-400' :
                      log.action === 'UPDATE' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-[#c0392b]/15 text-[#c0392b]'
                    }`}>{log.action}</span>
                    <span className="text-xs text-[#888]">{log.resource_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#444]">
                    <span>By: {log.performed_by}</span>
                    <span>{formatRelativeTime(log.created_at)}</span>
                  </div>
                  {log.previous_value && (
                    <div className="mt-2 p-2 bg-[#0d0d0d] rounded text-[10px] text-[#444] font-mono">
                      <span className="text-[#c0392b]">before: </span>
                      {JSON.stringify(log.previous_value)}
                    </div>
                  )}
                  {log.new_value && (
                    <div className="mt-1 p-2 bg-[#0d0d0d] rounded text-[10px] text-[#444] font-mono">
                      <span className="text-green-400">after: </span>
                      {JSON.stringify(log.new_value)}
                    </div>
                  )}
                </div>
              </div>
              {log.previous_value && !rolledBack.includes(log.id) && (
                <button
                  onClick={() => handleRollback(log.id)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-[#444] hover:text-[#d4af7a] transition-colors"
                >
                  <RotateCcw size={10} />Rollback
                </button>
              )}
              {rolledBack.includes(log.id) && (
                <p className="mt-2 text-[10px] text-green-400 flex items-center gap-1">
                  <CheckCircle size={10} />Rolled back
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="space-y-2">
          {DEMO_ERROR_LOGS.map(err => (
            <div key={err.id} className="bg-[#111] border border-[#c0392b]/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-[#c0392b] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#f0ede8] font-medium">{err.error_type}</p>
                  <p className="text-[11px] text-[#888] mt-0.5">{err.error_message}</p>
                  <p className="text-[10px] text-[#444] mt-1">{formatRelativeTime(err.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-[#444] mb-3">Integrations & Permissions</p>
          {INTEGRATIONS.map(int => (
            <div key={int.name} className="bg-[#111] border border-[#222] rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#f0ede8] font-medium">{int.name}</p>
                <p className="text-[11px] text-[#555] mt-0.5">{int.description}</p>
              </div>
              <StatusBadge status={int.status} />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-4">
          <Card variant="glass" className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#444] mb-3">AI Controls</p>
            <div className="space-y-3">
              {[
                { label: 'AI Autonomy', description: 'Allow AI to take actions automatically', enabled: false },
                { label: 'Simulation Mode', description: 'Test AI suggestions without saving', enabled: true },
                { label: 'Approval Required', description: 'All AI actions require user approval', enabled: true },
              ].map(control => (
                <div key={control.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#f0ede8]">{control.label}</p>
                    <p className="text-[10px] text-[#444]">{control.description}</p>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors ${control.enabled ? 'bg-[#d4af7a]' : 'bg-[#222]'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${control.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#444] mb-2">Monthly Token Budget</p>
            <div className="flex justify-between items-center">
              <div className="flex-1 bg-[#1a1a1a] rounded-full h-2 mr-3">
                <div className="bg-[#d4af7a] rounded-full h-2 w-[15%]" />
              </div>
              <span className="text-xs text-[#888]">~1,500 / 10,000 tokens</span>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#444] mb-2">AI Agent Rules</p>
            <div className="space-y-1.5">
              {[
                'No external action without user approval',
                'Evidence-first recommendations only',
                'Confidence scores required on all outputs',
                'Protect housing, food, communication first',
                'Human user always overrides system',
                'Log every AI action to audit trail',
                'Never permanently delete without confirmation',
              ].map((rule, i) => (
                <p key={i} className="text-[10px] text-[#555] flex items-start gap-2">
                  <span className="text-[#d4af7a] flex-shrink-0">{i + 1}.</span>
                  {rule}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
