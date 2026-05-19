-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- USERS table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'user' check (role in ('admin', 'user', 'guest', 'agent_service')),
  workspace_id uuid,
  crisis_mode boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WORKSPACES
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'My Workspace',
  owner_id uuid references public.profiles(id),
  crisis_threshold numeric default 5000,
  created_at timestamptz default now()
);

-- CASH UPDATES
create table public.cash_updates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric not null,
  note text,
  source text,
  created_at timestamptz default now()
);

-- BILLS
create table public.bills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  amount numeric not null,
  due_date date,
  category text check (category in ('rent','utilities','phone','car','insurance','subscription','food','medical','other')),
  status text default 'pending' check (status in ('pending','paid','overdue','partial','deferred')),
  priority integer default 5,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DEBTS
create table public.debts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  creditor_name text not null,
  amount numeric not null,
  amount_remaining numeric,
  debt_type text default 'personal' check (debt_type in ('personal','credit','loan','utility','rent','medical','other')),
  status text default 'active' check (status in ('active','paid','negotiating','deferred')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- REPAYMENTS
create table public.repayments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  debt_id uuid references public.debts(id),
  amount numeric not null,
  payment_date date default current_date,
  note text,
  created_at timestamptz default now()
);

-- INCOME SOURCES
create table public.income_sources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text check (type in ('employment','freelance','assistance','unemployment','noire','side','investment','other')),
  amount numeric,
  frequency text check (frequency in ('weekly','biweekly','monthly','one-time','irregular')),
  status text default 'active' check (status in ('active','pending','ended','paused')),
  expected_date date,
  note text,
  created_at timestamptz default now()
);

-- JOB APPLICATIONS
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  company text not null,
  role text not null,
  status text default 'applied' check (status in ('applied','screening','interview','offer','rejected','withdrawn','follow-up')),
  applied_date date default current_date,
  next_follow_up date,
  contact_name text,
  contact_email text,
  salary_range text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ASSISTANCE PROGRAMS
create table public.assistance_programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  program_name text not null,
  type text check (type in ('housing','utilities','food','medical','transportation','childcare','unemployment','other')),
  status text default 'researching' check (status in ('researching','applied','pending','approved','denied','enrolled','closed')),
  amount numeric,
  appointment_date timestamptz,
  contact_name text,
  contact_phone text,
  note text,
  created_at timestamptz default now()
);

-- REMINDERS
create table public.reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  due_at timestamptz,
  priority text default 'medium' check (priority in ('critical','high','medium','low')),
  category text,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- NOIRE INVENTORY
create table public.noire_inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  sku text,
  category text,
  quantity integer default 0,
  cost_per_unit numeric,
  price numeric,
  status text default 'active' check (status in ('active','sold-out','discontinued','sample')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOIRE LEADS
create table public.noire_leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  contact text,
  platform text,
  interest text,
  status text default 'new' check (status in ('new','warm','hot','closed','lost')),
  estimated_value numeric,
  note text,
  created_at timestamptz default now()
);

-- NOIRE SALES
create table public.noire_sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  item_name text not null,
  quantity integer default 1,
  price numeric not null,
  buyer_name text,
  platform text,
  status text default 'pending' check (status in ('pending','paid','shipped','completed','refunded')),
  sale_date date default current_date,
  note text,
  created_at timestamptz default now()
);

-- NOIRE CAMPAIGNS
create table public.noire_campaigns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  objective text,
  status text default 'planning' check (status in ('planning','active','paused','complete')),
  start_date date,
  end_date date,
  budget numeric,
  note text,
  created_at timestamptz default now()
);

-- ARTIFACTS
create table public.artifacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  type text check (type in ('document','image','video','audio','screenshot','receipt','invoice','contract','form','note','other')),
  tags text[],
  category text,
  storage_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  ai_summary text,
  linked_project text,
  linked_task text,
  is_encrypted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ARTIFACT LINKS
create table public.artifact_links (
  id uuid default uuid_generate_v4() primary key,
  artifact_id uuid references public.artifacts(id) on delete cascade,
  linked_table text not null,
  linked_id uuid not null,
  created_at timestamptz default now()
);

-- HOME ISSUES
create table public.home_issues (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text check (category in ('maintenance','landlord','utility','safety','appliance','lease','other')),
  priority text default 'medium' check (priority in ('critical','high','medium','low')),
  status text default 'open' check (status in ('open','in-progress','pending-landlord','resolved','closed')),
  reported_date date default current_date,
  resolved_date date,
  note text,
  created_at timestamptz default now()
);

-- BODY LOGS
create table public.body_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  log_date date default current_date,
  sleep_hours numeric,
  stress_level integer check (stress_level between 1 and 10),
  hydration_oz numeric,
  workout_done boolean default false,
  workout_note text,
  meals text,
  energy_level integer check (energy_level between 1 and 10),
  nervous_system_note text,
  created_at timestamptz default now()
);

-- CALENDAR EVENTS
create table public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  category text,
  priority text default 'medium',
  is_recurring boolean default false,
  recurrence_rule text,
  location text,
  created_at timestamptz default now()
);

-- DAILY CHECK-INS
create table public.daily_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  checkin_date date default current_date,
  emotional_state text,
  pressure_level integer check (pressure_level between 1 and 10),
  clarity_level integer check (clarity_level between 1 and 10),
  primary_focus text,
  wins text,
  blockers text,
  gratitude text,
  cinematic_description text,
  song_of_moment text,
  created_at timestamptz default now(),
  unique(user_id, checkin_date)
);

-- LEGACY ENTRIES
create table public.legacy_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  content text,
  entry_type text check (entry_type in ('journal','memoir','poem','essay','documentary_note','milestone','reflection','letter','vision')),
  era_id uuid,
  tags text[],
  soundtrack text,
  emotional_theme text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LIFE ERAS
create table public.life_eras (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  start_date date,
  end_date date,
  is_current boolean default false,
  theme text,
  soundtrack text[],
  color text,
  created_at timestamptz default now()
);

-- EMOTIONAL STATES
create table public.emotional_states (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  state text not null,
  intensity integer check (intensity between 1 and 10),
  context text,
  recorded_at timestamptz default now()
);

-- RELATIONSHIPS
create table public.relationships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text check (type in ('family','friend','colleague','creditor','landlord','contact','child','partner','other')),
  contact_info jsonb,
  notes text,
  is_emergency_contact boolean default false,
  created_at timestamptz default now()
);

-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  status text default 'active' check (status in ('active','paused','complete','archived')),
  category text,
  priority integer default 5,
  due_date date,
  created_at timestamptz default now()
);

-- AGENT ROLES
create table public.agent_roles (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  title text not null,
  department text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- AGENT TASKS
create table public.agent_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  agent_role_id uuid references public.agent_roles(id),
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending','in-progress','awaiting-approval','complete','cancelled')),
  priority text default 'medium',
  requires_approval boolean default true,
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz default now()
);

-- AGENT OUTPUTS
create table public.agent_outputs (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.agent_tasks(id),
  user_id uuid references public.profiles(id) on delete cascade,
  agent_role_id uuid references public.agent_roles(id),
  output_type text,
  content jsonb,
  confidence_score numeric check (confidence_score between 0 and 1),
  status text default 'pending' check (status in ('pending','approved','rejected','rolled-back')),
  created_at timestamptz default now()
);

-- INTEGRATIONS
create table public.integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  service_name text not null,
  is_connected boolean default false,
  permissions jsonb,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

-- PERMISSIONS
create table public.permissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  resource text not null,
  action text not null,
  granted boolean default false,
  granted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  previous_value jsonb,
  new_value jsonb,
  performed_by text default 'user',
  ip_address text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ROLLBACK LOGS
create table public.rollback_logs (
  id uuid default uuid_generate_v4() primary key,
  audit_log_id uuid references public.audit_logs(id),
  user_id uuid references public.profiles(id),
  rolled_back_at timestamptz default now(),
  rolled_back_by text,
  status text default 'complete'
);

-- ERROR LOGS
create table public.error_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  error_type text,
  error_message text,
  stack_trace text,
  context jsonb,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.cash_updates enable row level security;
alter table public.bills enable row level security;
alter table public.debts enable row level security;
alter table public.repayments enable row level security;
alter table public.income_sources enable row level security;
alter table public.applications enable row level security;
alter table public.assistance_programs enable row level security;
alter table public.reminders enable row level security;
alter table public.noire_inventory enable row level security;
alter table public.noire_leads enable row level security;
alter table public.noire_sales enable row level security;
alter table public.noire_campaigns enable row level security;
alter table public.artifacts enable row level security;
alter table public.home_issues enable row level security;
alter table public.body_logs enable row level security;
alter table public.calendar_events enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.legacy_entries enable row level security;
alter table public.life_eras enable row level security;
alter table public.emotional_states enable row level security;
alter table public.relationships enable row level security;
alter table public.projects enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_outputs enable row level security;
alter table public.integrations enable row level security;
alter table public.permissions enable row level security;
alter table public.audit_logs enable row level security;

-- RLS Policies
create policy "Users own their profile" on public.profiles for all using (auth.uid() = id);
create policy "Users own their cash" on public.cash_updates for all using (auth.uid() = user_id);
create policy "Users own their bills" on public.bills for all using (auth.uid() = user_id);
create policy "Users own their debts" on public.debts for all using (auth.uid() = user_id);
create policy "Users own their repayments" on public.repayments for all using (auth.uid() = user_id);
create policy "Users own their income" on public.income_sources for all using (auth.uid() = user_id);
create policy "Users own their applications" on public.applications for all using (auth.uid() = user_id);
create policy "Users own their assistance" on public.assistance_programs for all using (auth.uid() = user_id);
create policy "Users own their reminders" on public.reminders for all using (auth.uid() = user_id);
create policy "Users own their inventory" on public.noire_inventory for all using (auth.uid() = user_id);
create policy "Users own their leads" on public.noire_leads for all using (auth.uid() = user_id);
create policy "Users own their sales" on public.noire_sales for all using (auth.uid() = user_id);
create policy "Users own their campaigns" on public.noire_campaigns for all using (auth.uid() = user_id);
create policy "Users own their artifacts" on public.artifacts for all using (auth.uid() = user_id);
create policy "Users own their home issues" on public.home_issues for all using (auth.uid() = user_id);
create policy "Users own their body logs" on public.body_logs for all using (auth.uid() = user_id);
create policy "Users own their calendar" on public.calendar_events for all using (auth.uid() = user_id);
create policy "Users own their checkins" on public.daily_checkins for all using (auth.uid() = user_id);
create policy "Users own their legacy" on public.legacy_entries for all using (auth.uid() = user_id);
create policy "Users own their eras" on public.life_eras for all using (auth.uid() = user_id);
create policy "Users own their emotions" on public.emotional_states for all using (auth.uid() = user_id);
create policy "Users own their relationships" on public.relationships for all using (auth.uid() = user_id);
create policy "Users own their projects" on public.projects for all using (auth.uid() = user_id);
create policy "Users own their agent tasks" on public.agent_tasks for all using (auth.uid() = user_id);
create policy "Users own their agent outputs" on public.agent_outputs for all using (auth.uid() = user_id);
create policy "Users own their integrations" on public.integrations for all using (auth.uid() = user_id);
create policy "Users own their permissions" on public.permissions for all using (auth.uid() = user_id);
create policy "Users own their audit logs" on public.audit_logs for all using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
