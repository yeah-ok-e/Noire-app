export type EmotionalStateOption = 'calm' | 'stressed' | 'focused' | 'overwhelmed' | 'determined' | 'anxious' | 'grateful' | 'energized'

export type CrisisReason =
  | 'cash_below_500'
  | 'rent_overdue'
  | 'crisis_mode_flag'
  | 'multiple_threats'

export interface CrisisState {
  isCrisis: boolean
  reasons: CrisisReason[]
  cashAmount: number
}

export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface QuickAddOption {
  label: string
  category: string
  action: string
}

export interface Threat {
  id: string
  type: 'bill' | 'debt' | 'car' | 'housing' | 'income' | 'assistance'
  title: string
  description: string
  amount?: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  dueDate?: string
}

export interface Opportunity {
  id: string
  type: 'income' | 'assistance' | 'noire' | 'employment'
  title: string
  description: string
  amount?: number
  expectedDate?: string
}

export interface Move {
  order: number
  title: string
  description: string
  category: string
  priority: 'critical' | 'high' | 'medium'
}

export interface DemoUser {
  id: string
  email: string
  full_name: string
  role: 'guest'
}

export interface OfflinePacketData {
  cashOnHand: number
  overdueItems: Array<{ name: string; amount: number; type: string }>
  debts: Array<{ creditor: string; amount: number }>
  emergencyContacts: Array<{ name: string; phone?: string; relationship: string }>
  nextMoves: string[]
  assistancePrograms: Array<{ name: string; status: string; appointmentDate?: string }>
  lastSynced: string
}

export type CardVariant = 'default' | 'threat' | 'opportunity' | 'glass' | 'crisis'

export type StatusColor = 'green' | 'yellow' | 'red' | 'gold' | 'muted' | 'blue'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  required?: boolean
  defaultValue?: string | number | boolean
}

export interface NoireCSuiteRole {
  code: string
  title: string
  fullTitle: string
  department: string
  description: string
  domains: string[]
  color: string
}

export interface CommandBarAction {
  type: 'navigate' | 'add' | 'update'
  target: string
  payload?: Record<string, unknown>
}
