-- Legacy OS — Initial Schema
-- Row-Level Security enabled on all tables
-- All data scoped to auth.uid() — zero cross-user access

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  display_name TEXT DEFAULT 'Eligah',
  system_mode TEXT DEFAULT 'demo' CHECK (system_mode IN ('demo', 'live', 'crisis')),
  encryption_key_hash TEXT, -- client-derived, never the key itself
  onboarding_complete BOOLEAN DEFAULT false,
  alfred_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self" ON public.profiles USING (auth.uid() = id);

-- ============================================================
-- FINANCIAL
-- ============================================================
CREATE TABLE public.cash_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  source TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.cash_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cash_self" ON public.cash_updates USING (auth.uid() = user_id);

CREATE TABLE public.bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12,2),
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'disputed')),
  category TEXT,
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bills_self" ON public.bills USING (auth.uid() = user_id);

-- ============================================================
-- NOIRE BRAND
-- ============================================================
CREATE TABLE public.noire_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact TEXT,
  value DECIMAL(12,2),
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'contacted', 'negotiating', 'won', 'lost')),
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.noire_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_self" ON public.noire_leads USING (auth.uid() = user_id);

CREATE TABLE public.noire_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  product TEXT,
  channel TEXT,
  note TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.noire_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "noire_tx_self" ON public.noire_transactions USING (auth.uid() = user_id);

-- ============================================================
-- LEGACY / JOURNAL
-- ============================================================
CREATE TABLE public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  era TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_self" ON public.journal_entries USING (auth.uid() = user_id);

-- ============================================================
-- ADHERENCE TRACKING
-- ============================================================
CREATE TABLE public.adherence_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('money', 'noire', 'body', 'family', 'discipline', 'reflection')),
  completed BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, log_date, category)
);
ALTER TABLE public.adherence_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "adherence_self" ON public.adherence_logs USING (auth.uid() = user_id);

-- ============================================================
-- GOALS / TARGETS
-- ============================================================
CREATE TABLE public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  target_amount DECIMAL(12,2),
  target_unit TEXT DEFAULT '$',
  description TEXT,
  category TEXT,
  color TEXT DEFAULT '#d4af7a',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_self" ON public.goals USING (auth.uid() = user_id);

CREATE TABLE public.goal_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  note TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.goal_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goal_tx_self" ON public.goal_transactions USING (auth.uid() = user_id);

-- ============================================================
-- BODY / HEALTH
-- ============================================================
CREATE TABLE public.body_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE,
  sleep_hours DECIMAL(4,1),
  water_oz INTEGER,
  mood TEXT,
  energy INTEGER CHECK (energy BETWEEN 1 AND 10),
  movement_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.body_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "body_self" ON public.body_logs USING (auth.uid() = user_id);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  previous_value JSONB,
  new_value JSONB,
  performed_by TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_self" ON public.audit_logs USING (auth.uid() = user_id);

-- ============================================================
-- ARTIFACTS
-- ============================================================
CREATE TABLE public.artifacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT,
  category TEXT,
  storage_path TEXT,
  tags TEXT[],
  ai_summary TEXT,
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artifacts_self" ON public.artifacts USING (auth.uid() = user_id);

-- ============================================================
-- ALFRED DIRECTIVES (agent command log)
-- ============================================================
CREATE TABLE public.alfred_directives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  directive TEXT NOT NULL,
  agent_assigned TEXT,
  response TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'escalated')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'crisis')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.alfred_directives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "directives_self" ON public.alfred_directives USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER journal_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.noire_leads FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER artifacts_updated_at BEFORE UPDATE ON public.artifacts FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_cash_user_date ON public.cash_updates(user_id, created_at DESC);
CREATE INDEX idx_bills_user_status ON public.bills(user_id, status);
CREATE INDEX idx_leads_user_status ON public.noire_leads(user_id, status);
CREATE INDEX idx_journal_user_date ON public.journal_entries(user_id, created_at DESC);
CREATE INDEX idx_adherence_user_date ON public.adherence_logs(user_id, log_date DESC);
CREATE INDEX idx_audit_user_date ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_artifacts_user ON public.artifacts(user_id, created_at DESC);
CREATE INDEX idx_directives_user ON public.alfred_directives(user_id, created_at DESC);
