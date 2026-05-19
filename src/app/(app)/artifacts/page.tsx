'use client'

import { useState, useRef } from 'react'
import { Plus, Search, Archive, FileText, Image, Film, Mic, Receipt, Trash2, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { Artifact } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  document: FileText,
  image: Image,
  video: Film,
  audio: Mic,
  receipt: Receipt,
  invoice: Receipt,
  screenshot: Image,
  default: Archive,
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
  {
    id: 'art-1', title: 'LIHEAP Application Copy', type: 'document',
    category: 'assistance', tags: ['liheap', 'utilities', 'assistance'],
    ai_summary: 'Energy assistance application — submitted. Appointment confirmed.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'art-2', title: 'Meineke Fuel Pump Quote', type: 'receipt',
    category: 'car', tags: ['car', 'meineke', 'repair'],
    ai_summary: 'Fuel pump replacement quote — $980 parts + labor.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'art-3', title: 'Noire Brand Guide v1', type: 'document',
    category: 'noire', tags: ['noire', 'brand', 'identity'],
    ai_summary: 'Core brand identity document — colors, fonts, tone, and visual language.',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(), updated_at: new Date().toISOString(),
  },
]

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<Partial<Artifact>[]>(DEMO_ARTIFACTS)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [detailArtifact, setDetailArtifact] = useState<Partial<Artifact> | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newSummary, setNewSummary] = useState('')

  const filtered = artifacts.filter(a => {
    const matchSearch = !search || (a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.ai_summary?.toLowerCase().includes(search.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())))
    const matchType = !filterType || a.type === filterType
    return matchSearch && matchType
  })

  const handleAdd = () => {
    if (!newTitle.trim()) return
    setArtifacts(prev => [...prev, {
      id: `art-${Date.now()}`,
      title: newTitle,
      type: (newType as Artifact['type']) || 'document',
      tags: newTags ? newTags.split(',').map(t => t.trim()) : [],
      ai_summary: newSummary || null,
      category: null,
      storage_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    setNewTitle(''); setNewType(''); setNewTags(''); setNewSummary('')
    setAddModal(false)
  }

  const handleDelete = (id: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== id))
    setDeleteConfirm(null)
    if (detailArtifact?.id === id) setDetailArtifact(null)
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary font-serif text-xl">Artifacts</h1>
          <p className="text-text-muted text-xs mt-0.5">Document Vault — {artifacts.length} items</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
        >
          <Plus size={12} />Upload
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artifacts..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-accent/60 transition-colors"
        >
          <option value="">All Types</option>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Artifacts Grid */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card variant="glass" className="p-6 text-center">
            <Archive size={32} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">No artifacts found.</p>
          </Card>
        ) : (
          filtered.map(artifact => {
            const Icon = TYPE_ICONS[artifact.type || 'default'] || TYPE_ICONS.default
            return (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card
                  variant="default"
                  className="p-3 cursor-pointer hover:border-border"
                  hoverable
                  onClick={() => setDetailArtifact(artifact)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-surface-2 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary font-medium truncate">{artifact.title}</p>
                      {artifact.ai_summary && (
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{artifact.ai_summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {artifact.type && <StatusBadge status={artifact.type} />}
                        {artifact.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted flex-shrink-0">
                      {formatRelativeTime(artifact.created_at)}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Artifact">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Title</label>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Document title"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:border-accent/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Type</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-accent/60 transition-colors"
            >
              <option value="">Select type</option>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Tags (comma-separated)</label>
            <input
              value={newTags}
              onChange={e => setNewTags(e.target.value)}
              placeholder="rent, legal, 2024"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:border-accent/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 block">Summary / Note</label>
            <textarea
              value={newSummary}
              onChange={e => setNewSummary(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:border-accent/60 transition-colors resize-none"
            />
          </div>
          <p className="text-xs text-text-muted">File upload available when Supabase Storage is connected.</p>
          <div className="flex gap-3">
            <button onClick={() => setAddModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-2.5 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors">Add Artifact</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailArtifact} onClose={() => setDetailArtifact(null)} title={detailArtifact?.title}>
        {detailArtifact && (
          <div className="space-y-4">
            {detailArtifact.type && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Type</p>
                <StatusBadge status={detailArtifact.type} />
              </div>
            )}
            {detailArtifact.ai_summary && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Summary</p>
                <p className="text-sm text-text-secondary">{detailArtifact.ai_summary}</p>
              </div>
            )}
            {detailArtifact.tags && detailArtifact.tags.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {detailArtifact.tags.map(tag => (
                    <span key={tag} className="text-xs text-text-muted border border-border px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Created</p>
              <p className="text-sm text-text-secondary">{formatDate(detailArtifact.created_at)}</p>
            </div>
            <div className="flex gap-3 pt-2 border-t border-border">
              <button className="flex-1 py-2 rounded-lg border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5">
                <Download size={13} />Download
              </button>
              <button
                onClick={() => setDeleteConfirm(detailArtifact.id || null)}
                className="py-2 px-4 rounded-lg border border-crisis/40 text-crisis text-sm hover:bg-crisis/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={13} />Delete
              </button>
            </div>
            {deleteConfirm === detailArtifact.id && (
              <div className="bg-crisis/10 border border-crisis/30 rounded-lg p-3">
                <p className="text-crisis text-sm mb-3">Delete this artifact permanently?</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg border border-border text-text-secondary text-xs hover:bg-surface-2 transition-colors">Cancel</button>
                  <button onClick={() => handleDelete(detailArtifact.id!)} className="flex-1 py-2 rounded-lg bg-crisis/20 border border-crisis text-crisis text-xs font-medium transition-colors">Confirm Delete</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
