export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'user' | 'guest' | 'agent_service'
  workspace_id: string | null
  crisis_mode: boolean
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  owner_id: string | null
  crisis_threshold: number
  created_at: string
}

export interface CashUpdate {
  id: string
  user_id: string
  amount: number
  note: string | null
  source: string | null
  created_at: string
}

export interface Bill {
  id: string
  user_id: string
  name: string
  amount: number
  due_date: string | null
  category: 'rent' | 'utilities' | 'phone' | 'car' | 'insurance' | 'subscription' | 'food' | 'medical' | 'other' | null
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'deferred'
  priority: number
  note: string | null
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  user_id: string
  creditor_name: string
  amount: number
  amount_remaining: number | null
  debt_type: 'personal' | 'credit' | 'loan' | 'utility' | 'rent' | 'medical' | 'other'
  status: 'active' | 'paid' | 'negotiating' | 'deferred'
  note: string | null
  created_at: string
  updated_at: string
}

export interface Repayment {
  id: string
  user_id: string
  debt_id: string | null
  amount: number
  payment_date: string
  note: string | null
  created_at: string
}

export interface IncomeSource {
  id: string
  user_id: string
  name: string
  type: 'employment' | 'freelance' | 'assistance' | 'unemployment' | 'noire' | 'side' | 'investment' | 'other' | null
  amount: number | null
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'one-time' | 'irregular' | null
  status: 'active' | 'pending' | 'ended' | 'paused'
  expected_date: string | null
  note: string | null
  created_at: string
}

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'follow-up'
  applied_date: string
  next_follow_up: string | null
  contact_name: string | null
  contact_email: string | null
  salary_range: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface AssistanceProgram {
  id: string
  user_id: string
  program_name: string
  type: 'housing' | 'utilities' | 'food' | 'medical' | 'transportation' | 'childcare' | 'unemployment' | 'other' | null
  status: 'researching' | 'applied' | 'pending' | 'approved' | 'denied' | 'enrolled' | 'closed'
  amount: number | null
  appointment_date: string | null
  contact_name: string | null
  contact_phone: string | null
  note: string | null
  created_at: string
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  body: string | null
  due_at: string | null
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface NoireInventoryItem {
  id: string
  user_id: string
  name: string
  sku: string | null
  category: string | null
  quantity: number
  cost_per_unit: number | null
  price: number | null
  status: 'active' | 'sold-out' | 'discontinued' | 'sample'
  note: string | null
  created_at: string
  updated_at: string
}

export interface NoireLead {
  id: string
  user_id: string
  name: string
  contact: string | null
  platform: string | null
  interest: string | null
  status: 'new' | 'warm' | 'hot' | 'closed' | 'lost'
  estimated_value: number | null
  note: string | null
  created_at: string
}

export interface NoireSale {
  id: string
  user_id: string
  item_name: string
  quantity: number
  price: number
  buyer_name: string | null
  platform: string | null
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'refunded'
  sale_date: string
  note: string | null
  created_at: string
}

export interface NoireCampaign {
  id: string
  user_id: string
  name: string
  objective: string | null
  status: 'planning' | 'active' | 'paused' | 'complete'
  start_date: string | null
  end_date: string | null
  budget: number | null
  note: string | null
  created_at: string
}

export interface Artifact {
  id: string
  user_id: string
  title: string
  type: 'document' | 'image' | 'video' | 'audio' | 'screenshot' | 'receipt' | 'invoice' | 'contract' | 'form' | 'note' | 'other' | null
  tags: string[] | null
  category: string | null
  storage_path: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  ai_summary: string | null
  linked_project: string | null
  linked_task: string | null
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export interface HomeIssue {
  id: string
  user_id: string
  title: string
  description: string | null
  category: 'maintenance' | 'landlord' | 'utility' | 'safety' | 'appliance' | 'lease' | 'other' | null
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'pending-landlord' | 'resolved' | 'closed'
  reported_date: string
  resolved_date: string | null
  note: string | null
  created_at: string
}

export interface BodyLog {
  id: string
  user_id: string
  log_date: string
  sleep_hours: number | null
  stress_level: number | null
  hydration_oz: number | null
  workout_done: boolean
  workout_note: string | null
  meals: string | null
  energy_level: number | null
  nervous_system_note: string | null
  created_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_at: string
  end_at: string | null
  category: string | null
  priority: string
  is_recurring: boolean
  recurrence_rule: string | null
  location: string | null
  created_at: string
}

export interface DailyCheckin {
  id: string
  user_id: string
  checkin_date: string
  emotional_state: string | null
  pressure_level: number | null
  clarity_level: number | null
  primary_focus: string | null
  wins: string | null
  blockers: string | null
  gratitude: string | null
  cinematic_description: string | null
  song_of_moment: string | null
  created_at: string
}

export interface LegacyEntry {
  id: string
  user_id: string
  title: string
  content: string | null
  entry_type: 'journal' | 'memoir' | 'poem' | 'essay' | 'documentary_note' | 'milestone' | 'reflection' | 'letter' | 'vision' | null
  era_id: string | null
  tags: string[] | null
  soundtrack: string | null
  emotional_theme: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface LifeEra {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  theme: string | null
  soundtrack: string[] | null
  color: string | null
  created_at: string
}

export interface EmotionalState {
  id: string
  user_id: string
  state: string
  intensity: number | null
  context: string | null
  recorded_at: string
}

export interface Relationship {
  id: string
  user_id: string
  name: string
  type: 'family' | 'friend' | 'colleague' | 'creditor' | 'landlord' | 'contact' | 'child' | 'partner' | 'other' | null
  contact_info: Record<string, string> | null
  notes: string | null
  is_emergency_contact: boolean
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'complete' | 'archived'
  category: string | null
  priority: number
  due_date: string | null
  created_at: string
}

export interface AgentRole {
  id: string
  name: string
  title: string
  department: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

export interface AgentTask {
  id: string
  user_id: string
  agent_role_id: string | null
  title: string
  description: string | null
  status: 'pending' | 'in-progress' | 'awaiting-approval' | 'complete' | 'cancelled'
  priority: string
  requires_approval: boolean
  approved_at: string | null
  approved_by: string | null
  created_at: string
}

export interface AgentOutput {
  id: string
  task_id: string | null
  user_id: string
  agent_role_id: string | null
  output_type: string | null
  content: Record<string, unknown> | null
  confidence_score: number | null
  status: 'pending' | 'approved' | 'rejected' | 'rolled-back'
  created_at: string
}

export interface Integration {
  id: string
  user_id: string
  service_name: string
  is_connected: boolean
  permissions: Record<string, unknown> | null
  last_synced_at: string | null
  created_at: string
}

export interface Permission {
  id: string
  user_id: string
  resource: string
  action: string
  granted: boolean
  granted_at: string | null
  revoked_at: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  performed_by: string
  ip_address: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ErrorLog {
  id: string
  user_id: string | null
  error_type: string | null
  error_message: string | null
  stack_trace: string | null
  context: Record<string, unknown> | null
  resolved: boolean
  created_at: string
}
