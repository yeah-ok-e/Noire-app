'use client'

import { useState } from 'react'
import { Plus, Zap, TrendingUp, Shield, BarChart2, Bitcoin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'

interface Application {
  id: string; company: string; role: string; status: string
  applied_date?: string; salary_range?: string; note?: string
}

const billFields: FormField[] = [
  { name: 'name', label: 'Bill Name', type: 'text', placeholder: 'e.g. Rent, Electric', required: true },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0', required: true },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  { name: 'category', label: 'Category', type: 'select', options: [
    { value: 'rent', label: 'Rent' }, { value: 'utilities', label: 'Utilities' },
    { value: 'phone', label: 'Phone' }, { value: 'car', label: 'Car' },
    { value: 'insurance', label: 'Insurance' }, { value: 'subscription', label: 'Subscription' },
    { value: 'food', label: 'Food' }, { value: 'medical', label: 'Medical' },
    { value: 'other', label: 'Other' },
  ], placeholder: 'Select category' },
  { name: 'priority', label: 'Priority (1=highest)', type: 'number', defaultValue: 5 },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Any details...' },
]

const debtFields: FormField[] = [
  { name: 'creditor_name', label: 'Creditor', type: 'text', placeholder: 'Name or company', required: true },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0', required: true },
  { name: 'debt_type', label: 'Type', type: 'select', options: [
    { value: 'personal', label: 'Personal' }, { value: 'credit', label: 'Credit Card' },
    { value: 'loan', label: 'Loan' }, { value: 'utility', label: 'Utility' },
    { value: 'rent', label: 'Rent' }, { value: 'medical', label: 'Medical' },
    { value: 'other', label: 'Other' },
  ], placeholder: 'Select type' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Context...' },
]

const cashFields: FormField[] = [
  { name: 'amount', label: 'Cash on Hand ($)', type: 'number', placeholder: '0', required: true },
  { name: 'note', label: 'Note', type: 'text', placeholder: 'Where it came from...' },
  { name: 'source', label: 'Source', type: 'text', placeholder: 'e.g. unemployment, noire sale' },
]

const incomeFields: FormField[] = [
  { name: 'name', label: 'Source Name', type: 'text', placeholder: 'e.g. Freelance Design', required: true },
  { name: 'type', label: 'Type', type: 'select', options: [
    { value: 'employment', label: 'Employment' }, { value: 'freelance', label: 'Freelance' },
    { value: 'unemployment', label: 'Unemployment' }, { value: 'noire', label: 'Noire' },
    { value: 'side', label: 'Side Hustle' }, { value: 'assistance', label: 'Assistance' },
    { value: 'other', label: 'Other' },
  ], placeholder: 'Select type' },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0' },
  { name: 'frequency', label: 'Frequency', type: 'select', options: [
    { value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Biweekly' },
    { value: 'monthly', label: 'Monthly' }, { value: 'one-time', label: 'One-time' },
    { value: 'irregular', label: 'Irregular' },
  ], placeholder: 'Select frequency' },
  { name: 'expected_date', label: 'Expected Date', type: 'date' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Details...' },
]

const assistanceFields: FormField[] = [
  { name: 'program_name', label: 'Program Name', type: 'text', placeholder: 'e.g. LIHEAP', required: true },
  { name: 'type', label: 'Type', type: 'select', options: [
    { value: 'housing', label: 'Housing' }, { value: 'utilities', label: 'Utilities' },
    { value: 'food', label: 'Food' }, { value: 'medical', label: 'Medical' },
    { value: 'unemployment', label: 'Unemployment' }, { value: 'other', label: 'Other' },
  ], placeholder: 'Select type' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'researching', label: 'Researching' }, { value: 'applied', label: 'Applied' },
    { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' },
  ], defaultValue: 'researching' },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: 'Expected amount' },
  { name: 'appointment_date', label: 'Appointment Date', type: 'date' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Details...' },
]

const appFields: FormField[] = [
  { name: 'company', label: 'Company', type: 'text', placeholder: 'Company name', required: true },
  { name: 'role', label: 'Role', type: 'text', placeholder: 'Job title', required: true },
  { name: 'applied_date', label: 'Applied Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'applied', label: 'Applied' }, { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Interview' }, { value: 'offer', label: 'Offer' },
    { value: 'follow-up', label: 'Follow-up' },
  ], defaultValue: 'applied' },
  { name: 'salary_range', label: 'Salary Range', type: 'text', placeholder: 'e.g. $45k–$55k' },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Notes...' },
]

const VISION_LINES = [
  'Same-day flights. Season-long vacations. Bora Bora as baseline.',
  'A scratch on the Lamborghini is laughable — "I needed an excuse anyway."',
  'Convoy with flags. Overqualified security. Freely travel the world and do good.',
  'Feed villages. Provide electricity. Impact generations — not simple charity.',
  'Community organization funded and operating at scale.',
  'The Embassy — diplomatic relationships everywhere. No customs friction.',
  'Light up a country\'s biggest monument. Make history in real time.',
  'Small island. Plane. Multi-city properties.',
  'Real-life Bruce Wayne meets Tony Stark — but without their limitations.',
]

const MONEY_AGENTS = [
  {
    code: 'Crypto', color: '#facc15', dept: 'Crypto Portfolio', pulse: true,
    Icon: Bitcoin,
    status: 'BTC DCA queued for Monday — portfolio up 4.2% this week',
    detail: 'Manages BTC and ETH positions. Dollar-cost averaging weekly. Stop-loss orders active. Monitors altcoin opportunities.',
    stats: [{ label: 'Strategy', value: 'DCA + Hold' }, { label: 'Allocation', value: '15% of portfolio' }, { label: 'Risk', value: 'Medium' }],
  },
  {
    code: 'Stocks', color: '#4ade80', dept: 'Equity Portfolio', pulse: false,
    Icon: TrendingUp,
    status: 'Index core stable — rebalancing scheduled Q3 2026',
    detail: 'Index fund core (70%), dividend stocks (20%), growth positions (10%). Automated rebalancing. Dividend reinvestment active.',
    stats: [{ label: 'Core', value: 'S&P 500 Index' }, { label: 'Yield', value: '2.3% dividend' }, { label: 'Risk', value: 'Low-Medium' }],
  },
  {
    code: 'Assets', color: '#d4af7a', dept: 'Asset Management', pulse: true,
    Icon: BarChart2,
    status: 'Net worth tracking active — next property goal: $85k down',
    detail: 'Full asset tracking across cash, crypto, stocks, Noire inventory, and future real estate. Net worth dashboard. Projection modeling.',
    stats: [{ label: 'Total Assets', value: 'Tracking' }, { label: 'Goal', value: 'Own property' }, { label: 'Timeline', value: '3–5 years' }],
  },
  {
    code: 'Shield', color: '#f472b6', dept: 'Protection', pulse: false,
    Icon: Shield,
    status: 'Emergency fund at 12% of target — auto-save plan active',
    detail: 'Emergency fund ($10k target). Insurance optimization. LLC formation for asset protection. Debt elimination sequencing.',
    stats: [{ label: 'E-Fund Target', value: '$10,000' }, { label: 'Progress', value: '12%' }, { label: 'Priority', value: 'High' }],
  },
]

const LINKED_ACCOUNTS = [
  {
    id: 'fidelity', name: 'Fidelity Investments', type: 'Brokerage / Retirement', status: 'pending',
    icon: '📈', note: 'Connect to sync investments, 401k, and Roth IRA balances',
    mockBalance: '$4,820', color: '#4ade80',
  },
  {
    id: 'chase', name: 'Chase Checking', type: 'Bank Account', status: 'pending',
    icon: '🏦', note: 'Connect to auto-sync cash balance and transactions',
    mockBalance: '$1,240', color: '#60a5fa',
  },
  {
    id: 'coinbase', name: 'Coinbase', type: 'Crypto Exchange', status: 'pending',
    icon: '₿', note: 'Connect to track BTC, ETH, and alt positions in real time',
    mockBalance: '$680', color: '#facc15',
  },
  {
    id: 'kraken', name: 'Kraken', type: 'Crypto Exchange', status: 'pending',
    icon: '⚡', note: 'Secondary crypto account — connects via read-only API key',
    mockBalance: '—', color: '#a78bfa',
  },
  {
    id: 'cash-app', name: 'Cash App', type: 'P2P / Spending', status: 'pending',
    icon: '💸', note: 'Track daily spending, Noire transactions, and P2P transfers',
    mockBalance: '—', color: '#d4af7a',
  },
]

const WEALTH_MILESTONES = [
  'First $10k month',
  'Car with zero payment anxiety',
  'First investment account opened',
  'Own property',
  '$100k net worth',
  'First $1M year',
  'Private jet access (charter → ownership)',
  'Multi-property portfolio',
  'Endowment: community organization fully funded',
  'The island',
]

export default function MoneyPage() {
  const { store, getCurrentCash, addBill, addDebt, addCashUpdate, demoData } = useDemoMode()
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'income' | 'vision'>('overview')
  const [selectedAgent, setSelectedAgent] = useState<typeof MONEY_AGENTS[0] | null>(null)
  const [linkedAccounts, setLinkedAccounts] = useState(LINKED_ACCOUNTS)
  const [addModal, setAddModal] = useState<'bill' | 'debt' | 'cash' | 'income' | 'application' | 'assistance' | null>(null)
  const [incomeSources, setIncomeSources] = useState(demoData.incomeSources)
  const [assistancePrograms, setAssistancePrograms] = useState(demoData.assistancePrograms)
  const [applications, setApplications] = useState<Application[]>([])
  const [impactPercent, setImpactPercent] = useState(10)

  const cashAmount = getCurrentCash()
  const totalBills = store.bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0)
  const totalDebt = store.debts.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount_remaining ?? d.amount), 0)
  const totalIncome = incomeSources.filter(i => i.status === 'active' && i.amount).reduce((s, i) => s + (i.amount || 0), 0)
  const netFlow = totalIncome - totalBills
  const overdueBills = store.bills.filter(b => b.status === 'overdue')
  const sortedBills = [...store.bills].sort((a, b) => a.priority - b.priority)
  const cashColor = cashAmount < 500 ? 'text-crisis' : cashAmount < 2000 ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary font-serif text-xl">Money</h1>
          <p className="text-text-muted text-xs mt-0.5">Everything in & out — when, where, why</p>
        </div>
        <button
          onClick={() => setAddModal('cash')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
        >
          <Plus size={12} />Update Cash
        </button>
      </div>

      {/* Cash Snapshot */}
      <Card variant={cashAmount < 500 ? 'crisis' : 'default'} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Cash on Hand</p>
        <p className={clsx('text-5xl font-light tracking-tight', cashColor)}>{formatCurrency(cashAmount)}</p>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">In / Month</p>
            <p className="text-sm text-green-400 mt-0.5 font-medium">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Out / Month</p>
            <p className="text-sm text-text-primary mt-0.5 font-medium">{formatCurrency(totalBills)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Net Flow</p>
            <p className={clsx('text-sm mt-0.5 font-medium', netFlow >= 0 ? 'text-green-400' : 'text-crisis')}>
              {netFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netFlow))}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-none gap-1 bg-surface-2 rounded-lg p-1">
        {(['overview', 'bills', 'income', 'vision'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-shrink-0 flex-1 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all',
              activeTab === tab ? 'bg-surface text-accent border border-border' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
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
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Upcoming Bills</p>
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
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Active Income</p>
            {incomeSources.filter(i => i.status === 'active').slice(0, 3).map(source => (
              <div key={source.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <p className="text-sm text-text-primary">{source.name}</p>
                <p className="text-green-400 font-medium">{source.amount ? formatCurrency(source.amount) : '—'}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Debts</p>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-secondary">Total outstanding</p>
              <p className="text-text-primary font-medium text-sm">{formatCurrency(totalDebt)}</p>
            </div>
            {store.debts.slice(0, 3).map(debt => (
              <div key={debt.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-text-muted">{debt.creditor_name}</span>
                <span className="text-xs text-text-secondary">{formatCurrency(debt.amount_remaining ?? debt.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bills */}
      {activeTab === 'bills' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Bills & Obligations</p>
            <div className="flex gap-3">
              <button onClick={() => setAddModal('debt')} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary">
                <Plus size={10} />Debt
              </button>
              <button onClick={() => setAddModal('bill')} className="flex items-center gap-1 text-xs text-accent">
                <Plus size={10} />Bill
              </button>
            </div>
          </div>
          {sortedBills.map(bill => (
            <Card key={bill.id} variant={bill.status === 'overdue' ? 'threat' : 'default'} className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-primary font-medium">{bill.name}</p>
                    {bill.category && (
                      <span className="text-[9px] uppercase text-text-muted border border-border px-1.5 py-0.5 rounded">{bill.category}</span>
                    )}
                  </div>
                  {bill.due_date && <p className="text-xs text-text-muted mt-1">{formatDate(bill.due_date)}</p>}
                  {bill.note && <p className="text-xs text-text-muted mt-1">{bill.note}</p>}
                </div>
                <div className="text-right ml-3">
                  <p className={clsx('font-medium', bill.status === 'overdue' ? 'text-crisis' : 'text-text-primary')}>{formatCurrency(bill.amount)}</p>
                  <StatusBadge status={bill.status} className="mt-1" />
                </div>
              </div>
            </Card>
          ))}
          {store.debts.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Personal Debts</p>
              {store.debts.map(debt => (
                <Card key={debt.id} variant="default" className="p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-primary font-medium">{debt.creditor_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase text-text-muted">{debt.debt_type}</span>
                        <StatusBadge status={debt.status} />
                      </div>
                      {debt.note && <p className="text-xs text-text-muted mt-1">{debt.note}</p>}
                    </div>
                    <p className="text-text-primary font-medium">{formatCurrency(debt.amount_remaining ?? debt.amount)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Income */}
      {activeTab === 'income' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Income Streams</p>
            <button onClick={() => setAddModal('income')} className="flex items-center gap-1 text-xs text-accent">
              <Plus size={10} />Add
            </button>
          </div>
          <div className="space-y-2">
            {incomeSources.map(source => (
              <Card key={source.id} variant={source.type === 'unemployment' ? 'opportunity' : 'default'} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-primary font-medium">{source.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase text-text-muted">{source.type}</span>
                      {source.frequency && <span className="text-[10px] text-text-muted">{source.frequency}</span>}
                      <StatusBadge status={source.status} />
                    </div>
                    {source.expected_date && (
                      <p className="text-xs text-accent mt-1">Expected: {formatDate(source.expected_date)}</p>
                    )}
                    {source.note && <p className="text-xs text-text-muted mt-1">{source.note}</p>}
                  </div>
                  {source.amount && <p className="text-green-400 font-medium">{formatCurrency(source.amount)}</p>}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Job Applications</p>
            <button onClick={() => setAddModal('application')} className="flex items-center gap-1 text-xs text-accent">
              <Plus size={10} />Add
            </button>
          </div>
          {applications.length === 0 ? (
            <Card variant="glass" className="p-4 text-center">
              <p className="text-text-muted text-sm">No applications tracked yet.</p>
              <button onClick={() => setAddModal('application')} className="mt-2 text-accent text-xs hover:underline">
                Add first application
              </button>
            </Card>
          ) : (
            <div className="space-y-2">
              {applications.map(app => (
                <Card key={app.id} variant="default" className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-text-primary font-medium">{app.company}</p>
                      <p className="text-xs text-text-secondary">{app.role}</p>
                      {app.salary_range && <p className="text-xs text-accent mt-0.5">{app.salary_range}</p>}
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vision */}
      {activeTab === 'vision' && (
        <div className="space-y-6">
          {/* AI Wealth Agents — scrollable block */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">AI Wealth Agents</p>
            <p className="text-xs text-text-muted mb-3">Autonomous agents managing every layer of your financial life.</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {MONEY_AGENTS.map(agent => {
                const AgentIcon = agent.Icon
                return (
                  <button
                    key={agent.code}
                    onClick={() => setSelectedAgent(agent)}
                    className="flex-shrink-0 w-44 bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors relative"
                  >
                    {agent.pulse && (
                      <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    )}
                    <AgentIcon size={18} style={{ color: agent.color }} className="mb-2" />
                    <p className="text-sm font-medium" style={{ color: agent.color }}>{agent.code}</p>
                    <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{agent.dept}</p>
                    <p className="text-[10px] text-text-muted mt-2 leading-relaxed line-clamp-3">{agent.status}</p>
                  </button>
                )
              })}
            </div>
            <div className="bg-surface border border-accent/10 rounded-xl p-4 mt-3">
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Collective Status</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                All agents operating in concert. Crypto averaging in. Stocks holding. Assets tracked. Shield monitoring liquidity.
              </p>
            </div>
          </div>
          {/* Impact Allocation */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Impact Allocation</p>
              <p className="text-accent text-sm font-medium">{impactPercent}%</p>
            </div>
            <Card variant="default" className="p-4">
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                {impactPercent}% of every dollar earned goes to real-world change. Not charity. Not a foundation donation. Direct action — feeding families, funding community infrastructure, enabling generational impact at scale.
              </p>
              <input
                type="range" min={1} max={30} value={impactPercent}
                onChange={e => setImpactPercent(Number(e.target.value))}
                className="w-full accent-[#d4af7a]"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-2">
                <span>1%</span>
                <span className="text-accent">Target: {formatCurrency(totalIncome * impactPercent / 100)}/mo</span>
                <span>30%</span>
              </div>
            </Card>
          </div>

          {/* Next Income Lane */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Next Income Lane</p>
            <Card variant="glass" className="p-4 border border-accent/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Zap size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">AI Recommendation</p>
                  <p className="text-sm text-text-primary font-medium mb-2">Freelance Design / Creative Direction</p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Your brand work for Noire already demonstrates a portfolio. Offering design and creative direction services for other brands can generate $2k–5k/mo part-time — without pulling attention from Noire. Once stable at $3k+/mo, layer in consulting retainers.
                  </p>
                  <div className="mt-3">
                    <span className="text-[9px] uppercase tracking-wider text-accent border border-accent/30 px-2.5 py-1 rounded">
                      Activate when: Noire hits $1,000/mo consistent
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Wealth Milestones */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">The Arc</p>
            <div className="space-y-2.5">
              {WEALTH_MILESTONES.map((milestone, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] text-text-muted">{i + 1}</span>
                  </div>
                  <p className="text-sm text-text-muted">{milestone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The Standard */}
          <Card variant="glass" className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">The Standard</p>
            <div className="space-y-2.5">
              {VISION_LINES.map((line, i) => (
                <p key={i} className="text-xs text-text-muted flex items-start gap-2.5">
                  <span className="text-accent mt-0.5 flex-shrink-0">◆</span>
                  {line}
                </p>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={addModal === 'bill'} onClose={() => setAddModal(null)} title="Add Bill">
        <QuickAddForm fields={billFields} onSubmit={data => {
          addBill({ name: String(data.name), amount: Number(data.amount), due_date: data.due_date ? String(data.due_date) : null, category: (data.category as 'rent') || null, status: 'pending', priority: Number(data.priority) || 5, note: data.note ? String(data.note) : null })
          setAddModal(null)
        }} onCancel={() => setAddModal(null)} submitLabel="Add Bill" />
      </Modal>

      <Modal isOpen={addModal === 'debt'} onClose={() => setAddModal(null)} title="Add Debt">
        <QuickAddForm fields={debtFields} onSubmit={data => {
          addDebt({ creditor_name: String(data.creditor_name), amount: Number(data.amount), amount_remaining: Number(data.amount), debt_type: (data.debt_type as 'personal') || 'personal', status: 'active', note: data.note ? String(data.note) : null })
          setAddModal(null)
        }} onCancel={() => setAddModal(null)} submitLabel="Add Debt" />
      </Modal>

      <Modal isOpen={addModal === 'cash'} onClose={() => setAddModal(null)} title="Update Cash">
        <QuickAddForm fields={cashFields} onSubmit={data => {
          addCashUpdate(Number(data.amount), String(data.note || ''), String(data.source || ''))
          setAddModal(null)
        }} onCancel={() => setAddModal(null)} submitLabel="Update Cash" />
      </Modal>

      <Modal isOpen={addModal === 'income'} onClose={() => setAddModal(null)} title="Add Income Source">
        <QuickAddForm fields={incomeFields} onSubmit={data => {
          setIncomeSources(prev => [...prev, { id: `inc-${Date.now()}`, user_id: 'demo', name: String(data.name), type: (data.type as 'employment') || null, amount: data.amount ? Number(data.amount) : null, frequency: (data.frequency as 'monthly') || null, status: 'active', expected_date: data.expected_date ? String(data.expected_date) : null, note: data.note ? String(data.note) : null, created_at: new Date().toISOString() }])
          setAddModal(null)
        }} onCancel={() => setAddModal(null)} submitLabel="Add Source" />
      </Modal>

      <Modal isOpen={addModal === 'application'} onClose={() => setAddModal(null)} title="Add Job Application">
        <QuickAddForm fields={appFields} onSubmit={data => {
          setApplications(prev => [...prev, { id: `app-${Date.now()}`, company: String(data.company), role: String(data.role), status: String(data.status || 'applied'), applied_date: data.applied_date ? String(data.applied_date) : undefined, salary_range: data.salary_range ? String(data.salary_range) : undefined, note: data.note ? String(data.note) : undefined }])
          setAddModal(null)
        }} onCancel={() => setAddModal(null)} submitLabel="Track Application" />
      </Modal>

      <Modal isOpen={!!selectedAgent} onClose={() => setSelectedAgent(null)} title={selectedAgent ? `${selectedAgent.code} — ${selectedAgent.dept}` : ''}>
        {selectedAgent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <selectedAgent.Icon size={28} style={{ color: selectedAgent.color }} />
              <div>
                <p className="text-lg font-medium" style={{ color: selectedAgent.color }}>{selectedAgent.code}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{selectedAgent.dept}</p>
              </div>
              <span className={clsx('ml-auto w-2 h-2 rounded-full', selectedAgent.pulse ? 'bg-green-400 animate-pulse' : 'bg-text-muted')} />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{selectedAgent.detail}</p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
              {selectedAgent.stats.map(s => (
                <div key={s.label} className="bg-surface-2 rounded-lg p-2.5 text-center">
                  <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-xs text-text-primary font-medium">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={addModal === 'assistance'} onClose={() => setAddModal(null)} title="Add Assistance Program">
        <QuickAddForm fields={assistanceFields} onSubmit={data => {
          setAssistancePrograms(prev => [...prev, { id: `assist-${Date.now()}`, user_id: 'demo', program_name: String(data.program_name), type: (data.type as 'housing') || null, status: (data.status as 'researching') || 'researching', amount: data.amount ? Number(data.amount) : null, appointment_date: data.appointment_date ? String(data.appointment_date) : null, contact_name: null, contact_phone: null, note: data.note ? String(data.note) : null, created_at: new Date().toISOString() }])
          setAddModal(null)
        }} onCancel={() => setAddModal(null)} submitLabel="Add Program" />
      </Modal>
    </div>
  )
}
