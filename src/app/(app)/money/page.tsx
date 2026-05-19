'use client'

import { useState } from 'react'
import { Plus, DollarSign, CreditCard, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'

const billFields: FormField[] = [
  { name: 'name', label: 'Bill Name', type: 'text', placeholder: 'e.g. Rent, Electric', required: true },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0', required: true },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  {
    name: 'category', label: 'Category', type: 'select',
    options: [
      { value: 'rent', label: 'Rent' }, { value: 'utilities', label: 'Utilities' },
      { value: 'phone', label: 'Phone' }, { value: 'car', label: 'Car' },
      { value: 'insurance', label: 'Insurance' }, { value: 'subscription', label: 'Subscription' },
      { value: 'food', label: 'Food' }, { value: 'medical', label: 'Medical' },
      { value: 'other', label: 'Other' },
    ],
    placeholder: 'Select category',
  },
  { name: 'priority', label: 'Priority (1=highest)', type: 'number', defaultValue: 5 },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Any details...' },
]

const debtFields: FormField[] = [
  { name: 'creditor_name', label: 'Creditor', type: 'text', placeholder: 'Name or company', required: true },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0', required: true },
  {
    name: 'debt_type', label: 'Type', type: 'select',
    options: [
      { value: 'personal', label: 'Personal' }, { value: 'credit', label: 'Credit Card' },
      { value: 'loan', label: 'Loan' }, { value: 'utility', label: 'Utility' },
      { value: 'rent', label: 'Rent' }, { value: 'medical', label: 'Medical' },
      { value: 'other', label: 'Other' },
    ],
    placeholder: 'Select type',
  },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Context...' },
]

const cashFields: FormField[] = [
  { name: 'amount', label: 'Cash on Hand ($)', type: 'number', placeholder: '0', required: true },
  { name: 'note', label: 'Note', type: 'text', placeholder: 'Where it came from...' },
  { name: 'source', label: 'Source', type: 'text', placeholder: 'e.g. unemployment, noire sale' },
]

export default function MoneyPage() {
  const { store, getCurrentCash, addBill, addDebt, addCashUpdate } = useDemoMode()
  const [addModal, setAddModal] = useState<'bill' | 'debt' | 'cash' | null>(null)
  const [activeTab, setActiveTab] = useState<'bills' | 'debts' | 'overview'>('overview')

  const cashAmount = getCurrentCash()
  const totalBills = store.bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0)
  const totalDebt = store.debts.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount_remaining ?? d.amount), 0)
  const overdueBills = store.bills.filter(b => b.status === 'overdue')

  const sortedBills = [...store.bills].sort((a, b) => a.priority - b.priority)

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary font-serif text-xl">Money</h1>
          <p className="text-text-muted text-xs mt-0.5">Financial Command Center</p>
        </div>
        <button
          onClick={() => setAddModal('cash')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
        >
          <Plus size={12} />
          Update Cash
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card variant="default" className="p-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">On Hand</p>
          <p className={clsx('text-lg font-medium mt-1', cashAmount < 500 ? 'text-crisis' : cashAmount < 2000 ? 'text-yellow-400' : 'text-green-400')}>
            {formatCurrency(cashAmount)}
          </p>
        </Card>
        <Card variant="default" className="p-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">Bills Due</p>
          <p className="text-lg font-medium text-text-primary mt-1">{formatCurrency(totalBills)}</p>
        </Card>
        <Card variant="default" className="p-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-text-muted">Total Debt</p>
          <p className="text-lg font-medium text-text-primary mt-1">{formatCurrency(totalDebt)}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
        {(['overview', 'bills', 'debts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all',
              activeTab === tab
                ? 'bg-surface text-accent border border-border'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {overdueBills.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-crisis mb-2">Overdue</p>
              {overdueBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between py-2.5 border-b border-crisis/20">
                  <div>
                    <p className="text-sm text-text-primary">{bill.name}</p>
                    {bill.due_date && <p className="text-[10px] text-text-muted">Due {formatDate(bill.due_date)}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-crisis font-medium">{formatCurrency(bill.amount)}</p>
                    <StatusBadge status="overdue" className="mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Next 30 Days</p>
            {sortedBills.filter(b => b.status !== 'paid').slice(0, 5).map(bill => (
              <div key={bill.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-text-primary">{bill.name}</p>
                  {bill.due_date && <p className="text-[10px] text-text-muted">{formatDate(bill.due_date)}</p>}
                </div>
                <div className="text-right">
                  <p className="text-text-primary">{formatCurrency(bill.amount)}</p>
                  <StatusBadge status={bill.status} className="mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">All Bills</p>
            <button
              onClick={() => setAddModal('bill')}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus size={12} />
              Add Bill
            </button>
          </div>
          {sortedBills.map(bill => (
            <Card key={bill.id} variant={bill.status === 'overdue' ? 'threat' : 'default'} className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-primary font-medium">{bill.name}</p>
                    {bill.category && (
                      <span className="text-[9px] uppercase text-text-muted border border-border px-1.5 py-0.5 rounded">
                        {bill.category}
                      </span>
                    )}
                  </div>
                  {bill.due_date && (
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(bill.due_date)}
                    </p>
                  )}
                  {bill.note && <p className="text-xs text-text-muted mt-1">{bill.note}</p>}
                </div>
                <div className="text-right ml-3">
                  <p className={clsx('font-medium', bill.status === 'overdue' ? 'text-crisis' : 'text-text-primary')}>
                    {formatCurrency(bill.amount)}
                  </p>
                  <StatusBadge status={bill.status} className="mt-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Active Debts</p>
            <button
              onClick={() => setAddModal('debt')}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus size={12} />
              Add Debt
            </button>
          </div>
          {store.debts.map(debt => (
            <Card key={debt.id} variant="default" className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary font-medium">{debt.creditor_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase text-text-muted">{debt.debt_type}</span>
                    <StatusBadge status={debt.status} />
                  </div>
                  {debt.note && <p className="text-xs text-text-muted mt-1">{debt.note}</p>}
                </div>
                <p className="text-text-primary font-medium">
                  {formatCurrency(debt.amount_remaining ?? debt.amount)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={addModal === 'bill'} onClose={() => setAddModal(null)} title="Add Bill">
        <QuickAddForm
          fields={billFields}
          onSubmit={data => {
            addBill({
              name: String(data.name),
              amount: Number(data.amount),
              due_date: data.due_date ? String(data.due_date) : null,
              category: (data.category as 'rent') || null,
              status: 'pending',
              priority: Number(data.priority) || 5,
              note: data.note ? String(data.note) : null,
            })
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Bill"
        />
      </Modal>

      <Modal isOpen={addModal === 'debt'} onClose={() => setAddModal(null)} title="Add Debt">
        <QuickAddForm
          fields={debtFields}
          onSubmit={data => {
            addDebt({
              creditor_name: String(data.creditor_name),
              amount: Number(data.amount),
              amount_remaining: Number(data.amount),
              debt_type: (data.debt_type as 'personal') || 'personal',
              status: 'active',
              note: data.note ? String(data.note) : null,
            })
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Debt"
        />
      </Modal>

      <Modal isOpen={addModal === 'cash'} onClose={() => setAddModal(null)} title="Update Cash on Hand">
        <QuickAddForm
          fields={cashFields}
          onSubmit={data => {
            addCashUpdate(Number(data.amount), String(data.note || ''), String(data.source || ''))
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Update Cash"
        />
      </Modal>
    </div>
  )
}
