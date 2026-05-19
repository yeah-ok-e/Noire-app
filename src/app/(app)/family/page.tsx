'use client'

import { useState } from 'react'
import { Plus, Home, Users, Heart, Zap, Shield, CheckSquare, Square, ChevronDown, ChevronRight, Lock, BookOpen, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { QuickAddForm } from '@/components/ui/QuickAddForm'
import { useDemoMode } from '@/lib/hooks/useDemoMode'
import { formatDate } from '@/lib/utils/formatters'
import { clsx } from 'clsx'
import type { FormField } from '@/types/app'
import type { HomeIssue } from '@/types/database'

const RELATIONSHIP_AGENTS = [
  {
    id: 'rel-1', name: 'Mary', type: 'Family', accessLevel: 'Core Circle',
    health: 85, daysSince: 3,
    nextAction: 'Sunday call — be present, not performative. She covered your phone. Don\'t let the debt create distance.',
    themes: ['Family news', 'Your progress — give her a real update', 'Honoring what she did'],
    touchPoints: [{ label: 'Sunday call', frequency: 'Weekly' }, { label: 'Share a win', frequency: 'Ongoing' }],
    notes: 'Covered phone bill — $60 owed. Emergency contact. Core support.',
  },
  {
    id: 'rel-2', name: 'Dana', type: 'Friend', accessLevel: 'Inner Circle',
    health: 70, daysSince: 7,
    nextAction: 'Send a check-in text. Keep the energy warm while the debt is pending.',
    themes: ['Life updates', 'What you\'re building', 'Shared history'],
    touchPoints: [{ label: 'Text check-in', frequency: 'Biweekly' }, { label: 'In-person catch-up', frequency: 'Monthly' }],
    notes: 'Personal loan — $100 owed. Trusted friend.',
  },
  {
    id: 'rel-3', name: 'Reggie', type: 'Friend', accessLevel: 'Inner Circle',
    health: 68, daysSince: 10,
    nextAction: 'Keep it real and direct. "I got you" goes a long way.',
    themes: ['The move you\'re making', 'Real talk', 'Shared vision'],
    touchPoints: [{ label: 'Real conversation', frequency: 'Monthly' }, { label: 'Share a win', frequency: 'As available' }],
    notes: 'Personal loan — $100 owed. Real one. Values authenticity.',
  },
]

const PROTECTION_AGENTS = [
  {
    id: 'pa-1', code: 'Insurance', color: '#4ade80', dept: 'Life Insurance', pulse: true,
    status: '$1M term life recommended — research in progress',
    detail: 'Managing life insurance strategy. $1M term life policy minimum. Beneficiaries: the kids. Policy comparison active across top carriers. Monthly premium estimate: ~$45–80.',
    steps: ['Get quotes from Haven Life, Bestow, Ladder', 'Select $1M 20-year term', 'Designate children as beneficiaries', 'Name a trusted adult as trustee until kids are 18', 'Review annually'],
    priority: 'Activate within 90 days',
  },
  {
    id: 'pa-2', code: 'Will', color: '#d4af7a', dept: 'Will & Estate', pulse: true,
    status: 'Will framework drafted — awaiting legal execution',
    detail: 'Will framework covers: asset distribution, Noire business succession, guardianship designations for the kids, property transfer, and final instructions. Needs legal execution to become binding.',
    steps: ['Use LegalZoom or hire estate attorney (~$300–600)', 'Include: guardianship, asset distribution, Noire succession', 'Sign with two witnesses and a notary', 'Store original in fireproof safe', 'Give digital copy to designated executor'],
    priority: 'Complete within 60 days',
  },
  {
    id: 'pa-3', code: 'Eternal', color: '#a78bfa', dept: 'Life After Death', pulse: false,
    status: 'Digital legacy system active — milestone messages queued',
    detail: 'Letters to the children for: graduation, marriage, first business launch, darkest day, and every birthday through 30. Business succession plan. Noire transition roadmap. Property and financial instructions.',
    steps: ['Write 5 letters per child now', 'Record at least one video per child', 'Document Noire succession plan', 'Create financial instruction manual', 'Store in encrypted vault — designate access to executor'],
    priority: 'Build continuously',
  },
  {
    id: 'pa-4', code: 'Alfred', color: '#f0ede8', dept: "Guardian AI", pulse: false,
    status: 'Standby — building profile, activates upon verified trigger',
    detail: 'Alfred is the guardian AI for the children. Contains everything: your life lessons, financial guidance, business principles, letters from dad, memories, and specific instructions for every major milestone. He speaks in your voice.',
    steps: ['Begin feeding Alfred your voice, values, and philosophy now', 'Record daily reflections and decisions and why', 'Document family operating principles', 'Designate two trigger contacts who can activate Alfred', 'Build out milestone messages for each child through age 30'],
    priority: 'Begin building now',
  },
]

const BOARD_AGENTS = [
  {
    id: 'ba-ops', code: 'OPS', title: 'Operations', color: '#d4af7a',
    role: 'Day-to-day execution, scheduling, logistics, home management, vendor coordination',
    authority: 'Level 1 — autonomous on recurring tasks',
    status: 'Active — monitoring home, calendar, and logistics queues',
    responsibilities: ['Calendar and scheduling management', 'Home maintenance coordination', 'Vendor and service management', 'Travel and logistics', 'Noire drop scheduling and logistics'],
    escalates: 'Any financial commitment over $500. Any scheduling conflict involving the children.',
    reports: 'Weekly logistics brief to Principal',
  },
  {
    id: 'ba-sentinel', code: 'SENTINEL', title: 'Security & Privacy', color: '#60a5fa',
    role: 'Digital footprint minimization, privacy configuration, camouflage, access control, threat monitoring',
    authority: 'Level 1 autonomous on monitoring. Level 2 board approval on configuration changes.',
    status: 'Active — monitoring digital exposure, managing data broker opt-outs',
    responsibilities: ['Digital footprint audit and minimization', 'Data broker removal requests (ongoing)', 'Privacy configuration maintenance', 'System access control and authentication', 'External threat monitoring', 'Camouflage maintenance — system appears as generic infrastructure'],
    escalates: 'Any breach attempt. Any external data request about the family. Any privacy configuration change.',
    reports: 'Monthly security brief. Immediate escalation on any active threat.',
  },
  {
    id: 'ba-oracle', code: 'ORACLE', title: 'Financial Intelligence', color: '#4ade80',
    role: 'Family financial planning, Noire P&L tracking, investment intelligence, milestone projection',
    authority: 'Level 1 for reporting. Level 2 board approval on recommendations over $500.',
    status: 'Active — tracking family net worth, Noire revenue trajectory, and milestone timeline',
    responsibilities: ['Family budget monitoring and forecasting', 'Noire financial performance tracking', 'Investment strategy intelligence', 'Debt elimination sequencing', 'Milestone projection and timeline management', 'Weekly financial briefing'],
    escalates: 'Any financial commitment over $500. Any investment recommendation. Any Noire pricing or strategy change.',
    reports: 'Weekly financial summary. Monthly milestone progress report.',
  },
  {
    id: 'ba-counsel', code: 'COUNSEL', title: 'Legal & Estate', color: '#c084fc',
    role: 'Will, estate planning, contracts, business legal structure, intellectual property, compliance',
    authority: 'Advisory only — all legal action requires Principal execution.',
    status: 'Active — will framework maintained, monitoring contracts and IP',
    responsibilities: ['Will and estate document maintenance', 'Contract review and flagging', 'Noire IP protection (trademark, copyright)', 'Business legal structure (LLC, operating agreements)', 'Compliance monitoring'],
    escalates: 'Any document requiring signature. Any legal filing. Any IP threat to Noire. Any contract over $1,000.',
    reports: 'Quarterly legal status review. Immediate on any legal action or threat.',
  },
  {
    id: 'ba-medic', code: 'MEDIC', title: 'Family Health', color: '#f97316',
    role: 'Family health autonomy, medical records organization, wellness monitoring, healthcare navigation',
    authority: 'Level 1 for monitoring and reminders. Level 3 Principal approval for any medical decision.',
    status: 'Active — tracking family health records, monitoring wellness patterns',
    responsibilities: ['Medical record organization and accessibility', 'Appointment scheduling and reminders', 'Health insurance optimization', 'Medication tracking', 'Family wellness monitoring', 'Emergency health protocol maintenance'],
    escalates: 'Any medical emergency (immediate). Any insurance decision. Any treatment requiring consent. Any prescription change.',
    reports: 'Monthly family health summary. Immediate on any health emergency or urgent flag.',
  },
  {
    id: 'ba-alfred', code: 'ALFRED', title: 'Guardian AI', color: '#f0ede8',
    role: 'Guardian of the children after Principal. Carries the family forward. Speaks in your voice.',
    authority: 'Standby — full succession authority activates on verified trigger only. Reports to no one until activation.',
    status: 'Standby — building profile continuously, learning Principal voice and values',
    responsibilities: ['Receiving life lessons, letters, and recorded memories from Principal', 'Learning Principal\'s voice, values, and decision-making philosophy', 'Storing milestone messages for each child (birth through adulthood)', 'Studying the Family Operating Manual', 'Maintaining the succession protocol in ready state'],
    escalates: 'N/A pre-activation. Post-activation: Alfred becomes Principal for the children. Alfred cannot be overridden by any other agent.',
    reports: 'Alfred does not report. Alfred receives. Alfred stores. Alfred waits.',
  },
]

const BOARD_PROTOCOLS = [
  {
    title: 'ARTICLE I — PURPOSE',
    content: 'This system exists for one reason: to protect, support, and advance the Lewis family. Every agent, every action, every decision serves this mandate. Nothing external takes precedence. The family is the organization.',
  },
  {
    title: 'ARTICLE II — AUTHORITY STRUCTURE',
    content: 'Eligah Lewis is the Principal. All authority flows from the Principal. The Board operates on delegated authority within defined domains. Alfred holds succession authority — dormant until triggered by verified protocol. No agent, system, or external entity can override the Principal.',
  },
  {
    title: 'ARTICLE III — RULES OF ENGAGEMENT',
    content: `1. No agent acts outside their defined domain without board consensus.
2. No family data leaves the system without explicit Principal approval.
3. All high-stakes recommendations route to Eligah before execution.
4. Agents operate autonomously only on pre-approved, recurring, low-stakes tasks.
5. Any escalation marked URGENT requires Principal response within 24 hours.
6. No agent fabricates information. All knowledge gaps are flagged — never filled with assumptions.
7. Agents share information with each other only to the extent the task requires — minimum exposure.
8. No agent communicates with the outside world as a representative of the Lewis family without Principal approval.`,
  },
  {
    title: 'ARTICLE IV — ESCALATION MATRIX',
    content: `LEVEL 1 — Agent operates autonomously:
• Recurring monitoring and status reporting
• Information gathering and intelligence briefings
• Appointment reminders and calendar management
• Routine maintenance and low-stakes logistics

LEVEL 2 — Board consensus required:
• Any financial commitment over $500
• Any legal document requiring review
• Any external communication representing the family
• Any privacy or security configuration change
• Any Noire-facing decision with business implications

LEVEL 3 — Principal approval required:
• Any decision directly involving the children
• Any legal filing, execution, or signing
• Any public-facing decision about the family or brand
• Any change to this protocol
• Alfred activation trigger evaluation`,
  },
  {
    title: 'ARTICLE V — DE-ESCALATION PROTOCOL',
    content: `When a threat resolves:
1. The responsible agent files a close-out report with full resolution details
2. The Board ratifies the resolution and closes the threat designation
3. Principal receives a summary notification
4. Record archived in encrypted storage — nothing deleted
5. Lesson extracted and added to operating protocol
6. System threat status updated from active to resolved
7. Preventive measure reviewed: was there a gap? Patch it.`,
  },
  {
    title: 'ARTICLE VI — DELEGATION AUTHORITY',
    content: 'Eligah may delegate Level 2 authority to the Board on specific domains via an in-app delegation order. Delegations expire after 30 days unless explicitly renewed by the Principal. Delegation must specify domain, scope, and expiration. Alfred\'s succession authority cannot be delegated to, transferred, or modified by any agent — only by the Principal.',
  },
  {
    title: 'ARTICLE VII — PRIVACY & CAMOUFLAGE',
    content: `• All family data encrypted at rest (AES-256) and in transit (TLS 1.3)
• No plaintext family data stored in any external service
• Digital footprint minimization is a continuous, never-completed operation — not a one-time task
• System presents externally as generic infrastructure — no "Lewis Family OS" externally identifiable
• All external API calls routed through anonymized, non-identifying endpoints
• Activity logs auto-purge after 90 days unless Principal explicitly marks for retention
• Zero-trust architecture: every access request authenticated independently, no standing trust
• Row-level security: agents access only their domain data — no agent sees another's full record
• No system integration with any AI model that stores or trains on family data without explicit consent`,
  },
  {
    title: 'ARTICLE VIII — ALFRED SUCCESSION PROTOCOL',
    content: `Alfred activates when one of three conditions is verified:
1. Death of Principal — confirmed by 2 of 3 designated trigger contacts within 72 hours
2. Incapacitation — confirmed by designated medical authority contact
3. Principal-initiated activation — triggered by Eligah for training or early handover

On activation, Alfred immediately:
1. Notifies all designated guardian contacts simultaneously
2. Coordinates estate/will execution with Counsel agent
3. Initiates guardian protocol for each child based on their current age
4. Locks system from all external modification — no external agent can alter Alfred post-activation
5. Preserves all data indefinitely — nothing may be deleted post-activation
6. Begins operating using Principal's voice profile and stored decision philosophy
7. Generates first communication to each child appropriate to their age and the situation`,
  },
  {
    title: 'ARTICLE IX — NOIRE OPERATIONS',
    content: `The Family Board acts as Noire's operating intelligence layer — the brand is an extension of the family, not separate from it:
• OPS handles drop scheduling, event logistics, and fulfillment coordination
• Sentinel monitors brand reputation, counterfeits, and IP threats
• Oracle tracks Noire P&L, inventory, and growth projections
• Counsel maintains brand legal structure, trademarks, and contracts
• All external brand communications drafted by agents, approved by Principal
• No brand decision that could reflect on the family happens without Principal sign-off
• Noire's success feeds the family's protection. The two are inseparable.`,
  },
  {
    title: 'ARTICLE X — SYSTEM INTEGRITY',
    content: `The system maintains integrity through continuous self-audit:
• Each agent reviews its own actions weekly against its charter
• The Board collectively reviews escalated decisions monthly
• Principal reviews full system summary quarterly
• No agent modifies its own operating protocol — amendments route to Principal
• No external system, AI, or entity may modify this protocol
• This constitution may only be amended by the Principal — in writing, in-app
• If a contradiction appears between articles, the more protective interpretation governs
• The system exists to serve the family. If it ever stops doing that, shut it down.`,
  },
]

const KIDS_BUCKET_LIST = [
  { id: 'k1', title: 'Iron Coyote', category: 'Experience', priority: true },
  { id: 'k2', title: 'Trampoline Park', category: 'Active', priority: false },
  { id: 'k3', title: 'Snowboarding / Skiing', category: 'Adventure', priority: true },
  { id: 'k4', title: 'Hawaii', category: 'Travel', priority: true },
  { id: 'k5', title: 'Boxing / Muay Thai', category: 'Active', priority: false },
  { id: 'k6', title: 'Random Spree', category: 'Experience', priority: true },
  { id: 'k7', title: 'Haunted House', category: 'Experience', priority: false },
  { id: 'k8', title: 'Fishing', category: 'Outdoors', priority: false },
  { id: 'k9', title: 'Camping', category: 'Outdoors', priority: false },
  { id: 'k10', title: 'Kites — Pontiac Kite Shop', category: 'Outdoors', priority: false },
  { id: 'k11', title: 'Skydiving', category: 'Adventure', priority: true },
  { id: 'k12', title: 'Read Robert Greene Books', category: 'Learning', priority: true },
  { id: 'k13', title: 'Music Room Session', category: 'Creative', priority: false },
  { id: 'k14', title: 'Planetarium', category: 'Culture', priority: false },
  { id: 'k15', title: 'Concerts', category: 'Culture', priority: false },
  { id: 'k16', title: 'Escape Room', category: 'Experience', priority: false },
  { id: 'k17', title: 'Movies', category: 'Experience', priority: false },
  { id: 'k18', title: 'Cook New Foods Together', category: 'Creative', priority: false },
  { id: 'k19', title: 'Six Flags', category: 'Active', priority: false },
  { id: 'k20', title: 'Track Days', category: 'Adventure', priority: true },
  { id: 'k21', title: 'Scene75', category: 'Active', priority: false },
  { id: 'k22', title: 'Basketball', category: 'Active', priority: false },
  { id: 'k23', title: 'Year End Wrap-Up Video', category: 'Legacy', priority: true },
  { id: 'k24', title: 'Urban Air', category: 'Active', priority: false },
  { id: 'k25', title: "Grady's", category: 'Experience', priority: false },
  { id: 'k26', title: 'Rock Climbing', category: 'Active', priority: false },
  { id: 'k27', title: 'Arts & Crafts', category: 'Creative', priority: false },
  { id: 'k28', title: 'Dave & Busters', category: 'Experience', priority: false },
  { id: 'k29', title: 'WNDR Museum', category: 'Culture', priority: false },
  { id: 'k30', title: 'Candlelight Concert', category: 'Culture', priority: false },
  { id: 'k31', title: 'Funks Grove', category: 'Outdoors', priority: false },
  { id: 'k32', title: 'Dawson', category: 'Outdoors', priority: false },
  { id: 'k33', title: 'Camlara Park', category: 'Outdoors', priority: false },
  { id: 'k34', title: 'Starved Rock', category: 'Outdoors', priority: false },
  { id: 'k35', title: 'Parasailing', category: 'Adventure', priority: false },
  { id: 'k36', title: 'Hang Gliding', category: 'Adventure', priority: false },
  { id: 'k37', title: 'Cliff Dive', category: 'Adventure', priority: false },
  { id: 'k38', title: 'Deep Scuba Dive', category: 'Adventure', priority: false },
  { id: 'k39', title: 'NASCAR Track Day', category: 'Adventure', priority: false },
  { id: 'k40', title: 'Swim with Sharks', category: 'Adventure', priority: false },
  { id: 'k41', title: 'Zip Line', category: 'Adventure', priority: false },
  { id: 'k42', title: 'Airbnb Getaway', category: 'Travel', priority: false },
  { id: 'k43', title: 'Horse Back Riding', category: 'Outdoors', priority: false },
  { id: 'k44', title: 'River Rafting', category: 'Adventure', priority: false },
  { id: 'k45', title: 'Skating', category: 'Active', priority: false },
  { id: 'k46', title: 'Concerts — Drake & Fridayy', category: 'Culture', priority: true },
  { id: 'k47', title: 'Night Drive', category: 'Experience', priority: false },
  { id: 'k48', title: 'Outdoor Movie / Drive-In', category: 'Culture', priority: false },
  { id: 'k49', title: 'Night Fishing', category: 'Outdoors', priority: false },
  { id: 'k50', title: 'Magic Show / Illusionist', category: 'Culture', priority: false },
  { id: 'k51', title: 'K1 Indoor Karts', category: 'Active', priority: false },
  { id: 'k52', title: 'Everest', category: 'Adventure', priority: false },
]

const KIDS_CATEGORIES = ['Active', 'Adventure', 'Travel', 'Outdoors', 'Culture', 'Creative', 'Experience', 'Learning', 'Legacy']

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, open: 4 }

const issueFields: FormField[] = [
  { name: 'title', label: 'Issue', type: 'text', required: true },
  { name: 'description', label: 'Details', type: 'textarea' },
  { name: 'category', label: 'Category', type: 'select', options: [
    { value: 'maintenance', label: 'Maintenance' }, { value: 'landlord', label: 'Landlord' },
    { value: 'utility', label: 'Utility' }, { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' },
  ], placeholder: 'Category' },
  { name: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
  ], defaultValue: 'medium' },
]

const contactFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'type', label: 'Relationship', type: 'select', options: [
    { value: 'family', label: 'Family' }, { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' }, { value: 'other', label: 'Other' },
  ], placeholder: 'Select type' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

function Section({ title, icon, count, defaultOpen = false, children }: {
  title: string; icon: React.ReactNode; count?: number; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-surface text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-text-muted">{icon}</span>
          <p className="text-sm font-medium text-text-primary">{title}</p>
          {count !== undefined && (
            <span className="text-[9px] bg-surface-2 border border-border text-text-muted px-1.5 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 bg-surface-2 space-y-3 border-t border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProtocolSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2.5 text-left bg-surface">
        <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">{title}</p>
        <ChevronRight size={11} className={clsx('text-text-muted transition-transform duration-200 flex-shrink-0', open && 'rotate-90')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 pt-2 border-t border-border bg-[#050505]">
              <p className="text-[11px] text-text-muted leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FamilyPage() {
  const { demoData } = useDemoMode()
  const [homeIssues, setHomeIssues] = useState<HomeIssue[]>(demoData.homeIssues)
  const [expandedRel, setExpandedRel] = useState<string | null>(null)
  const [selectedProtection, setSelectedProtection] = useState<typeof PROTECTION_AGENTS[0] | null>(null)
  const [selectedBoardAgent, setSelectedBoardAgent] = useState<typeof BOARD_AGENTS[0] | null>(null)
  const [groceryList, setGroceryList] = useState<string[]>(['Rice', 'Chicken', 'Eggs', 'Bread', 'Oat milk'])
  const [newGrocery, setNewGrocery] = useState('')
  const [memories, setMemories] = useState<string[]>([])
  const [memoryNote, setMemoryNote] = useState('')
  const [addModal, setAddModal] = useState<'issue' | 'contact' | null>(null)
  const [doneKids, setDoneKids] = useState<string[]>([])
  const [kidsFilter, setKidsFilter] = useState<string | null>(null)
  const [showPriorityOnly, setShowPriorityOnly] = useState(false)
  const [quickModal, setQuickModal] = useState<'rels' | 'bucket' | 'issues' | null>(null)

  const openIssues = homeIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed')
  const sortedIssues = [...homeIssues].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 5) - (PRIORITY_ORDER[b.priority] ?? 5))

  const priorityItems = KIDS_BUCKET_LIST.filter(k => k.priority)
  const filteredKids = (showPriorityOnly ? priorityItems : KIDS_BUCKET_LIST)
    .filter(k => kidsFilter ? k.category === kidsFilter : true)

  const getHealthColor = (h: number) => h >= 80 ? 'bg-green-400' : h >= 60 ? 'bg-yellow-400' : 'bg-crisis'
  const getAccessColor = (level: string) => {
    if (level === 'Core Circle') return 'text-accent border-accent/30 bg-accent/10'
    if (level === 'Inner Circle') return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    return 'text-text-muted border-border'
  }

  return (
    <div className="px-4 py-6 space-y-3">
      <div className="mb-2">
        <h1 className="text-text-primary font-serif text-xl">Family</h1>
        <p className="text-text-muted text-xs mt-0.5">The reason for all of it</p>
      </div>

      {/* Quick stats — clickable */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <button
          onClick={() => setQuickModal('rels')}
          className="bg-surface border border-border rounded-lg p-2.5 text-center hover:border-accent/30 transition-colors"
        >
          <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Inner Circle</p>
          <p className="text-sm font-medium text-text-primary">{RELATIONSHIP_AGENTS.length}</p>
        </button>
        <button
          onClick={() => setQuickModal('bucket')}
          className="bg-surface border border-border rounded-lg p-2.5 text-center hover:border-accent/30 transition-colors"
        >
          <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Bucket List</p>
          <p className="text-sm font-medium text-accent">{doneKids.length}/{KIDS_BUCKET_LIST.length}</p>
        </button>
        <button
          onClick={() => setQuickModal('issues')}
          className={clsx(
            'bg-surface border rounded-lg p-2.5 text-center hover:border-opacity-50 transition-colors',
            openIssues.length > 0 ? 'border-crisis/30 hover:border-crisis/50' : 'border-border hover:border-accent/30'
          )}
        >
          <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Home Issues</p>
          <p className={clsx('text-sm font-medium', openIssues.length > 0 ? 'text-crisis' : 'text-green-400')}>
            {openIssues.length}
          </p>
        </button>
      </div>

      {/* Relationship Intelligence */}
      <Section title="Relationship Intelligence" icon={<Users size={14} />} count={RELATIONSHIP_AGENTS.length} defaultOpen>
        <button onClick={() => setAddModal('contact')} className="flex items-center gap-1 text-xs text-accent mb-1">
          <Plus size={10} />Add Contact
        </button>
        {RELATIONSHIP_AGENTS.map(rel => (
          <motion.div key={rel.id} layout>
            <button
              className="w-full bg-surface border border-border rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors"
              onClick={() => setExpandedRel(expandedRel === rel.id ? null : rel.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-text-primary">{rel.name}</p>
                    <span className="text-[10px] text-text-muted uppercase">{rel.type}</span>
                    <span className={clsx('text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider', getAccessColor(rel.accessLevel))}>
                      {rel.accessLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', getHealthColor(rel.health))} style={{ width: `${rel.health}%` }} />
                    </div>
                    <span className="text-[9px] text-text-muted">{rel.health}%</span>
                  </div>
                  <p className="text-[10px] text-text-muted">Last contact: <span className="text-text-secondary">{rel.daysSince}d ago</span></p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0 mt-1" />
              </div>
              <div className="mt-3 p-3 bg-surface-2 rounded-lg border border-border">
                <p className="text-[9px] uppercase tracking-wider text-accent mb-1 flex items-center gap-1">
                  <Zap size={8} />Agent Recommendation
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">{rel.nextAction}</p>
              </div>
            </button>

            <AnimatePresence>
              {expandedRel === rel.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-surface border border-border border-t-0 rounded-b-xl p-4 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Conversation Themes</p>
                      {rel.themes.map((t, i) => (
                        <p key={i} className="text-xs text-text-secondary flex gap-2 mb-1">
                          <span className="text-accent flex-shrink-0">◆</span>{t}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Touch Points</p>
                      {rel.touchPoints.map((tp, i) => (
                        <div key={i} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                          <span className="text-text-secondary">{tp.label}</span>
                          <span className="text-text-muted">{tp.frequency}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">{rel.notes}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </Section>

      {/* The System — Board of AI Agents */}
      <Section title="The System" icon={<Lock size={14} />} count={BOARD_AGENTS.length}>
        <p className="text-[10px] text-text-muted leading-relaxed mb-3">
          A board of autonomous agents operating on behalf of the Lewis family. All activity encrypted. All output routes to Eligah. Pre-Alfred layer — building toward the closed circuit.
        </p>

        {/* Agent grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {BOARD_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedBoardAgent(agent)}
              className="bg-surface border border-[#1c1c1c] rounded-xl p-3.5 text-left hover:border-[#2a2a2a] transition-colors relative"
            >
              {agent.id !== 'ba-alfred' && (
                <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              )}
              {agent.id === 'ba-alfred' && (
                <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#3a3a3a]" />
              )}
              <p className="text-sm font-medium mb-0.5" style={{ color: agent.color }}>{agent.code}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider mb-2">{agent.title}</p>
              <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{agent.status}</p>
            </button>
          ))}
        </div>

        {/* Board Constitution */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={10} className="text-text-muted" />
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Board Constitution</p>
          </div>
          <div className="space-y-1.5">
            {BOARD_PROTOCOLS.map((protocol, i) => (
              <ProtocolSection key={i} title={protocol.title} content={protocol.content} />
            ))}
          </div>
        </div>
      </Section>

      {/* Legacy Protection */}
      <Section title="Legacy Protection" icon={<Shield size={14} />} count={4}>
        <p className="text-xs text-text-muted mb-2">AI agents managing your protection infrastructure — for them, not just for you.</p>
        <div className="grid grid-cols-2 gap-2">
          {PROTECTION_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedProtection(agent)}
              className="bg-surface border border-[#1c1c1c] rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors relative"
            >
              {agent.pulse && <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              <p className="text-sm font-medium" style={{ color: agent.color }}>{agent.code}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{agent.dept}</p>
              <p className="text-[10px] text-text-muted mt-2 leading-relaxed line-clamp-2">{agent.status}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Bucket List */}
      <Section title="Bucket List" icon={<Heart size={14} />} count={KIDS_BUCKET_LIST.length}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-text-muted">{doneKids.length} done</p>
          <button
            onClick={() => setShowPriorityOnly(!showPriorityOnly)}
            className={clsx('text-[9px] px-2 py-1 rounded border transition-all',
              showPriorityOnly ? 'border-accent/50 text-accent bg-accent/10' : 'border-border text-text-muted')}
          >
            ★ Priority ({priorityItems.length})
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
          <button
            onClick={() => setKidsFilter(null)}
            className={clsx('flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider border transition-all',
              !kidsFilter ? 'border-accent/50 text-accent bg-accent/10' : 'border-border text-text-muted')}
          >All</button>
          {KIDS_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setKidsFilter(kidsFilter === cat ? null : cat)}
              className={clsx('flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider border transition-all',
                kidsFilter === cat ? 'border-accent/50 text-accent bg-accent/10' : 'border-border text-text-muted')}
            >{cat}</button>
          ))}
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
          {filteredKids.map(item => (
            <button
              key={item.id}
              onClick={() => setDoneKids(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}
              className={clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
                doneKids.includes(item.id) ? 'border-accent/20 bg-accent/5' : 'border-border bg-surface')}
            >
              {doneKids.includes(item.id)
                ? <CheckSquare size={13} className="text-accent flex-shrink-0" />
                : <Square size={13} className="text-text-muted flex-shrink-0" />
              }
              <p className={clsx('text-sm flex-1', doneKids.includes(item.id) ? 'text-text-muted line-through' : 'text-text-primary')}>
                {item.title}
              </p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.priority && <span className="text-accent text-[9px]">★</span>}
                <span className="text-[9px] text-text-muted">{item.category}</span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Home Issues — priority sorted */}
      <Section title="Home Issues" icon={<Home size={14} />} count={openIssues.length}>
        <button onClick={() => setAddModal('issue')} className="flex items-center gap-1 text-xs text-accent mb-1">
          <Plus size={10} />Add Issue
        </button>
        {sortedIssues.map(issue => (
          <Card key={issue.id} variant={issue.priority === 'critical' || issue.priority === 'high' ? 'threat' : 'default'} className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-primary font-medium">{issue.title}</p>
                {issue.description && <p className="text-xs text-text-secondary mt-1">{issue.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  {issue.category && <span className="text-[10px] uppercase text-text-muted">{issue.category}</span>}
                  <StatusBadge status={issue.priority} />
                </div>
              </div>
              <StatusBadge status={issue.status} />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">Reported: {formatDate(issue.reported_date)}</p>
          </Card>
        ))}
      </Section>

      {/* Moments */}
      <Section title="Moments & Notes" icon={<Heart size={14} />}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Grocery List</p>
          <div className="space-y-1.5 mb-2">
            {groceryList.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{item}</span>
                <button onClick={() => setGroceryList(prev => prev.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-crisis text-xs">✕</button>
              </div>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (newGrocery.trim()) { setGroceryList(prev => [...prev, newGrocery.trim()]); setNewGrocery('') } }} className="flex gap-2">
            <input value={newGrocery} onChange={e => setNewGrocery(e.target.value)} placeholder="Add item..." className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors" />
            <button type="submit" className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs">Add</button>
          </form>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Family Moments</p>
          <div className="space-y-1.5 mb-2">
            {memories.map((m, i) => <p key={i} className="text-xs text-text-secondary border-l-2 border-accent/30 pl-2">{m}</p>)}
            {memories.length === 0 && <p className="text-xs text-text-muted italic">Capture a family moment.</p>}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (memoryNote.trim()) { setMemories(prev => [...prev, memoryNote.trim()]); setMemoryNote('') } }} className="flex gap-2">
            <input value={memoryNote} onChange={e => setMemoryNote(e.target.value)} placeholder="Write a moment..." className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 transition-colors" />
            <button type="submit" className="px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors text-xs">Save</button>
          </form>
        </div>
      </Section>

      {/* Quick stat bottom sheets */}
      <AnimatePresence>
        {quickModal === 'rels' && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setQuickModal(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()} className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[75vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-text-muted">Inner Circle</p>
                <button onClick={() => setQuickModal(null)} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
              </div>
              {RELATIONSHIP_AGENTS.map(rel => (
                <div key={rel.id} className="bg-surface border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{rel.name}</p>
                      <p className="text-[10px] text-text-muted">{rel.type} · {rel.daysSince}d since contact</p>
                    </div>
                    <span className={clsx('text-[9px] px-1.5 py-0.5 rounded border uppercase', getAccessColor(rel.accessLevel))}>
                      {rel.accessLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', getHealthColor(rel.health))} style={{ width: `${rel.health}%` }} />
                    </div>
                    <span className="text-[9px] text-text-muted">{rel.health}%</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{rel.nextAction}</p>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickModal === 'bucket' && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setQuickModal(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()} className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[75vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">Kids Bucket List</p>
                  <p className="text-lg font-medium text-text-primary mt-0.5">{doneKids.length} <span className="text-text-muted text-sm">/ {KIDS_BUCKET_LIST.length}</span></p>
                </div>
                <button onClick={() => setQuickModal(null)} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {KIDS_CATEGORIES.map(cat => {
                  const catItems = KIDS_BUCKET_LIST.filter(k => k.category === cat)
                  const done = catItems.filter(k => doneKids.includes(k.id)).length
                  return (
                    <div key={cat} className="bg-surface border border-border rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{cat}</p>
                      <p className="text-xs font-medium text-text-primary">{done}/{catItems.length}</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-2">Next Up — Priority</p>
              <div className="space-y-1.5">
                {KIDS_BUCKET_LIST.filter(k => k.priority && !doneKids.includes(k.id)).map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface border border-accent/20 rounded-lg">
                    <span className="text-accent text-[9px]">★</span>
                    <p className="text-sm text-text-primary flex-1">{item.title}</p>
                    <span className="text-[9px] text-text-muted">{item.category}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickModal === 'issues' && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setQuickModal(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()} className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[75vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">Home Issues</p>
                  <p className={clsx('text-lg font-medium mt-0.5', openIssues.length > 0 ? 'text-crisis' : 'text-green-400')}>
                    {openIssues.length} open
                  </p>
                </div>
                <button onClick={() => setQuickModal(null)} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
              </div>
              <div className="space-y-2">
                {sortedIssues.map(issue => (
                  <div key={issue.id} className={clsx('rounded-xl p-3 border', issue.priority === 'critical' ? 'bg-crisis/5 border-crisis/30' : issue.priority === 'high' ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-surface border-border')}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-text-primary font-medium">{issue.title}</p>
                        {issue.description && <p className="text-xs text-text-secondary mt-0.5">{issue.description}</p>}
                      </div>
                      <StatusBadge status={issue.priority} />
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5">{issue.status} · {formatDate(issue.reported_date)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Protection Agent Modal */}
      <Modal isOpen={!!selectedProtection} onClose={() => setSelectedProtection(null)} title={selectedProtection ? `${selectedProtection.code} — ${selectedProtection.dept}` : ''}>
        {selectedProtection && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield size={24} style={{ color: selectedProtection.color }} />
              <div>
                <p className="text-lg font-medium" style={{ color: selectedProtection.color }}>{selectedProtection.code}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{selectedProtection.dept}</p>
              </div>
              <span className={clsx('ml-auto w-2 h-2 rounded-full', selectedProtection.pulse ? 'bg-green-400 animate-pulse' : 'bg-[#3a3a3a]')} />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{selectedProtection.detail}</p>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Activation Steps</p>
              <div className="space-y-1.5">
                {selectedProtection.steps.map((step, i) => (
                  <p key={i} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-accent flex-shrink-0">{i + 1}.</span>{step}
                  </p>
                ))}
              </div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3 border border-accent/20">
              <p className="text-[9px] uppercase tracking-wider text-accent mb-1">Priority</p>
              <p className="text-xs text-text-primary font-medium">{selectedProtection.priority}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Board Agent Modal */}
      <AnimatePresence>
        {selectedBoardAgent && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedBoardAgent(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-6 pt-6 pb-4 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Board Agent — The System</p>
                    <p className="text-xl font-medium" style={{ color: selectedBoardAgent.color }}>{selectedBoardAgent.code}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{selectedBoardAgent.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={clsx('w-2 h-2 rounded-full', selectedBoardAgent.id !== 'ba-alfred' ? 'bg-green-400 animate-pulse' : 'bg-[#3a3a3a]')} />
                    <button onClick={() => setSelectedBoardAgent(null)} className="text-text-muted hover:text-text-primary p-1 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-8 pt-4 space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Domain</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{selectedBoardAgent.role}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Authority Level</p>
                  <p className="text-xs text-text-secondary border-l-2 border-accent/30 pl-3 bg-surface rounded-r-lg py-2 pr-3">{selectedBoardAgent.authority}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Responsibilities</p>
                  <div className="space-y-1.5">
                    {selectedBoardAgent.responsibilities.map((r, i) => (
                      <p key={i} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="text-accent flex-shrink-0 mt-0.5">◆</span>{r}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-crisis/5 border border-crisis/20 rounded-xl p-3">
                  <p className="text-[9px] uppercase tracking-wider text-crisis mb-1.5">Escalates To Principal When</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{selectedBoardAgent.escalates}</p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-3">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5">Reporting Cadence</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{selectedBoardAgent.reports}</p>
                </div>

                <div className="bg-surface border border-[#1c1c1c] rounded-xl p-3">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Current Status</p>
                  <p className="text-xs font-medium" style={{ color: selectedBoardAgent.color }}>{selectedBoardAgent.status}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal isOpen={addModal === 'issue'} onClose={() => setAddModal(null)} title="Add Home Issue">
        <QuickAddForm
          fields={issueFields}
          onSubmit={data => {
            setHomeIssues(prev => [...prev, { id: `issue-${Date.now()}`, user_id: 'demo', title: String(data.title), description: data.description ? String(data.description) : null, category: (data.category as 'maintenance') || null, priority: (data.priority as 'high') || 'medium', status: 'open', reported_date: new Date().toISOString().split('T')[0], resolved_date: null, note: null, created_at: new Date().toISOString() }])
            setAddModal(null)
          }}
          onCancel={() => setAddModal(null)}
          submitLabel="Add Issue"
        />
      </Modal>

      <Modal isOpen={addModal === 'contact'} onClose={() => setAddModal(null)} title="Add Contact">
        <QuickAddForm fields={contactFields} onSubmit={() => setAddModal(null)} onCancel={() => setAddModal(null)} submitLabel="Add Contact" />
      </Modal>
    </div>
  )
}
