'use client'

import { useState } from 'react'
import { Plus, ExternalLink, Gem } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatCurrency } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField, NoireCSuiteRole } from '@/types/app'

const C_SUITE_ROLES: NoireCSuiteRole[] = [
  {
    code: 'CEO', title: 'CEO', fullTitle: 'Chief Executive Officer',
    department: 'Executive', description: 'Brand vision, culture, and ultimate decision authority.',
    domains: ['Vision', 'Culture', 'Risk', 'Partnerships', 'Legacy'],
    color: 'text-accent',
  },
  {
    code: 'COO', title: 'COO', fullTitle: 'Chief Operations Officer',
    department: 'Operations', description: 'Production flow, fulfillment, and operational efficiency.',
    domains: ['Production', 'Fulfillment', 'Process', 'Quality', 'Timelines'],
    color: 'text-text-primary',
  },
  {
    code: 'CFO', title: 'CFO', fullTitle: 'Chief Financial Officer',
    department: 'Finance', description: 'Revenue tracking, COGS, margins, and reinvestment.',
    domains: ['Revenue', 'Margins', 'COGS', 'Cash Flow', 'Pricing'],
    color: 'text-green-400',
  },
  {
    code: 'CMO', title: 'CMO', fullTitle: 'Chief Marketing Officer',
    department: 'Marketing', description: 'Brand narrative, campaigns, content strategy.',
    domains: ['Campaigns', 'Content', 'Social', 'Drops', 'Narrative'],
    color: 'text-purple-400',
  },
  {
    code: 'CBO', title: 'CBO', fullTitle: 'Chief Brand Officer',
    department: 'Brand', description: 'Identity architecture, aesthetics, and cultural positioning.',
    domains: ['Identity', 'Aesthetics', 'Positioning', 'Tone', 'Visual Language'],
    color: 'text-accent',
  },
  {
    code: 'CRO', title: 'CRO', fullTitle: 'Chief Revenue Officer',
    department: 'Revenue', description: 'Sales strategy, lead pipeline, and conversion.',
    domains: ['Sales', 'Pipeline', 'Conversion', 'Wholesale', 'Pricing Strategy'],
    color: 'text-yellow-400',
  },
  {
    code: 'CCO', title: 'CCO', fullTitle: 'Chief Creative Officer',
    department: 'Creative', description: 'Design direction, product development, and visual output.',
    domains: ['Design', 'Product Dev', 'Photography', 'Mockups', 'Direction'],
    color: 'text-pink-400',
  },
  {
    code: 'CTO', title: 'CTO', fullTitle: 'Chief Technology Officer',
    department: 'Technology', description: 'E-commerce tech, automations, and digital infrastructure.',
    domains: ['Shopify', 'Automation', 'Data', 'Digital Tools', 'Infrastructure'],
    color: 'text-blue-400',
  },
]

const leadFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Customer name', required: true },
  { name: 'contact', label: 'Contact / Handle', type: 'text', placeholder: '@handle or email' },
  { name: 'platform', label: 'Platform', type: 'text', placeholder: 'Instagram, Email, etc.' },
  { name: 'interest', label: 'Interest', type: 'text', placeholder: 'What they want' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'new', label: 'New' }, { value: 'warm', label: 'Warm' },
      { value: 'hot', label: 'Hot' }, { value: 'closed', label: 'Closed' },
    ],
    defaultValue: 'new',
  },
  { name: 'estimated_value', label: 'Estimated Value ($)', type: 'number', placeholder: '0' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Context...' },
]

const saleFields: FormField[] = [
  { name: 'item_name', label: 'Item', type: 'text', placeholder: 'What was sold', required: true },
  { name: 'quantity', label: 'Quantity', type: 'number', defaultValue: 1 },
  { name: 'price', label: 'Sale Price ($)', type: 'number', required: true },
  { name: 'buyer_name', label: 'Buyer Name', type: 'text' },
  { name: 'platform', label: 'Platform', type: 'text', placeholder: 'Instagram, Shopify, etc.' },
  { name: 'note', label: 'Note', type: 'textarea' },
]

export default function NoirePage() {
  const { demoData } = useDemoMode()
  const [addModal, setAddModal] = useState<'lead' | 'sale' | null>(null)
  const [selectedRole, setSelectedRole] = useState<NoireCSuiteRole | null>(null)
  const [leads, setLeads] = useState(demoData.noireLeads)
  const [sales, setSales] = useState([] as Array<{
    id: string; item_name: string; price: number; buyer_name?: string;
    platform?: string; quantity: number; created_at: string
  }>)
  const [inventory] = useState(demoData.noireInventory)

  const totalInventoryValue = inventory.reduce((s, i) => s + ((i.price || 0) * i.quantity), 0)
  const hotLeads = leads.filter(l => l.status === 'hot').length
  const pipeline = leads.reduce((s, l) => s + (l.estimated_value || 0), 0)

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gem size={20} className="text-accent" />
        <div>
          <h1 className="text-text-primary font-serif text-xl tracking-wide">NOIRE HQ</h1>
          <p className="text-text-muted text-[10px] uppercase tracking-widest">Identity Architecture</p>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <Card variant="default" className="p-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">Inventory</p>
          <p className="text-base font-medium text-accent mt-1">{formatCurrency(totalInventoryValue)}</p>
        </Card>
        <Card variant="default" className="p-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">Pipeline</p>
          <p className="text-base font-medium text-text-primary mt-1">{formatCurrency(pipeline)}</p>
        </Card>
        <Card variant="default" className="p-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">Hot Leads</p>
          <p className="text-base font-medium text-yellow-400 mt-1">{hotLeads}</p>
        </Card>
      </div>

      {/* C-Suite Dashboard */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Executive Team</p>
        <div className="grid grid-cols-2 gap-2">
          {C_SUITE_ROLES.map(role => (
            <motion.button
              key={role.code}
              onClick={() => setSelectedRole(role)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-surface border border-border rounded-lg p-3 text-left hover:border-accent/30 transition-colors"
            >
              <p className={clsx('text-lg font-serif', role.color)}>{role.code}</p>
              <p className="text-[10px] text-text-muted mt-0.5 leading-tight">{role.department}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Inventory */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Inventory</p>
        <div className="space-y-2">
          {inventory.map(item => (
            <Card key={item.id} variant="default" className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.sku && <span className="text-[10px] text-text-muted">{item.sku}</span>}
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-accent font-medium">{formatCurrency(item.price)}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Qty: {item.quantity}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Leads */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Lead Pipeline</p>
          <button onClick={() => setAddModal('lead')} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <Plus size={12} />Add Lead
          </button>
        </div>
        <div className="space-y-2">
          {leads.map(lead => (
            <Card
              key={lead.id}
              variant={lead.status === 'hot' ? 'opportunity' : 'default'}
              className="p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{lead.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{lead.interest}</p>
                  {lead.platform && <p className="text-[10px] text-text-muted mt-0.5">{lead.platform}</p>}
                  {lead.note && <p className="text-xs text-text-muted mt-1">{lead.note}</p>}
                </div>
                <div className="text-right ml-3">
                  {lead.estimated_value && (
                    <p className="text-accent font-medium">{formatCurrency(lead.estimated_value)}</p>
                  )}
                  <StatusBadge status={lead.status} className="mt-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Sales */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Sales Ledger</p>
          <button onClick={() => setAddModal('sale')} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <Plus size={12} />Log Sale
          </button>
        </div>
        {sales.length === 0 ? (
          <Card variant="glass" className="p-4 text-center">
            <p className="text-text-muted text-sm">No sales logged yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sales.map(sale => (
              <Card key={sale.id} variant="default" className="p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-text-primary">{sale.item_name}</p>
                    {sale.buyer_name && <p className="text-xs text-text-muted">{sale.buyer_name}</p>}
                  </div>
                  <p className="text-green-400 font-medium">{formatCurrency(sale.price * sale.quantity)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Shopify Placeholder */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <ExternalLink size={14} className="text-text-muted" />
          <p className="text-text-secondary text-sm font-medium">Shopify Integration</p>
        </div>
        <p className="text-text-muted text-xs">
          Shopify store connection — coming soon. Will sync inventory, orders, and analytics directly into Noire HQ.
        </p>
      </Card>

      {/* Role Detail Modal */}
      <Modal isOpen={!!selectedRole} onClose={() => setSelectedRole(null)} title={selectedRole?.fullTitle}>
        {selectedRole && (
          <div className="space-y-4">
            <div>
              <p className={clsx('text-4xl font-serif', selectedRole.color)}>{selectedRole.code}</p>
              <p className="text-text-muted text-xs uppercase tracking-widest mt-1">{selectedRole.department}</p>
            </div>
            <p className="text-text-secondary text-sm">{selectedRole.description}</p>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Governor Domains</p>
              <div className="flex flex-wrap gap-2">
                {selectedRole.domains.map(d => (
                  <span key={d} className="px-2.5 py-1 bg-surface-2 border border-border rounded text-xs text-text-secondary">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Lead Modal */}
      <Modal isOpen={addModal === 'lead'} onClose={() => setAddModal(null)} title="Add Noire Lead">
        <QuickAddForm
          fields={leadFields}
          onSubmit={data => {
            setLeads(prev => [...prev, {
              id: `lead-${Date.now()}`,
              user_id: 'demo',
              name: String(data.name),
              contact: data.contact ? String(data.contact) : null,
              platform: data.platform ? String(data.platform) : null,
              interest: data.interest ? String(data.interest) : null,
              status: (data.status as 'new') || 'new',
              estimated_value: data.estimated_value ? Number(data.estimated_value) : null,
              note: data.note ? String(data.note) : null,
              created_at: new Date().toISOString(),
            }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Lead"
        />
      </Modal>

      {/* Log Sale Modal */}
      <Modal isOpen={addModal === 'sale'} onClose={() => setAddModal(null)} title="Log Noire Sale">
        <QuickAddForm
          fields={saleFields}
          onSubmit={data => {
            setSales(prev => [...prev, {
              id: `sale-${Date.now()}`,
              item_name: String(data.item_name),
              price: Number(data.price),
              buyer_name: data.buyer_name ? String(data.buyer_name) : undefined,
              platform: data.platform ? String(data.platform) : undefined,
              quantity: Number(data.quantity) || 1,
              created_at: new Date().toISOString(),
            }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Log Sale"
        />
      </Modal>
    </div>
  )
}
