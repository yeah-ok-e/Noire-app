-- LEGACY OS Seed Data
-- Run this after schema.sql to populate demo data
-- Replace 'USER_ID_HERE' with actual auth user UUID

-- Note: In demo mode, this data is provided via demoData.ts constants
-- This file is for Supabase-connected production seeding

-- Example seed (replace USER_ID with actual UUID after creating user):
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES ('USER_ID_HERE', 'lewis@family.com', 'Lewis Family', 'admin');

-- Cash Updates
-- INSERT INTO public.cash_updates (user_id, amount, note, source)
-- VALUES ('USER_ID_HERE', 234, 'Current cash on hand', 'manual');

-- Bills
-- INSERT INTO public.bills (user_id, name, amount, category, status, priority, due_date, note)
-- VALUES
--   ('USER_ID_HERE', 'Rent', 1100, 'rent', 'overdue', 1, current_date - interval '5 days', 'Past due — contact landlord'),
--   ('USER_ID_HERE', 'Light Bill (PPL/PECO)', 180, 'utilities', 'pending', 2, current_date + interval '3 days', 'LIHEAP may cover'),
--   ('USER_ID_HERE', 'Phone (owed to Mary)', 60, 'phone', 'pending', 3, current_date + interval '7 days', 'Personal debt to Mary for phone bill');

-- Debts
-- INSERT INTO public.debts (user_id, creditor_name, amount, amount_remaining, debt_type, status, note)
-- VALUES
--   ('USER_ID_HERE', 'Dana', 100, 100, 'personal', 'active', 'Personal loan'),
--   ('USER_ID_HERE', 'Reggie', 100, 100, 'personal', 'active', 'Personal loan'),
--   ('USER_ID_HERE', 'Mary', 60, 60, 'personal', 'active', 'Phone bill covered by Mary');

-- Income Sources
-- INSERT INTO public.income_sources (user_id, name, type, amount, frequency, status, expected_date, note)
-- VALUES
--   ('USER_ID_HERE', 'Unemployment Benefits', 'unemployment', 450, 'biweekly', 'active', current_date + interval '4 days', 'Certify Tuesday — deposit expected Thursday'),
--   ('USER_ID_HERE', 'Noire Brand Sales', 'noire', null, 'irregular', 'active', null, 'Active leads in pipeline');

-- Assistance Programs
-- INSERT INTO public.assistance_programs (user_id, program_name, type, status, appointment_date, note)
-- VALUES
--   ('USER_ID_HERE', 'LIHEAP Energy Assistance', 'utilities', 'applied', now() + interval '2 days', 'Appointment scheduled — bring utility bills and ID'),
--   ('USER_ID_HERE', 'Township Emergency Assistance', 'housing', 'applied', null, 'Application submitted — pending landlord section completion');

-- Noire Inventory
-- INSERT INTO public.noire_inventory (user_id, name, sku, category, quantity, cost_per_unit, price, status)
-- VALUES
--   ('USER_ID_HERE', 'Noire Classic Tee — Black L', 'NR-TEE-BLK-L', 'apparel', 3, 12, 45, 'active'),
--   ('USER_ID_HERE', 'Noire Fitted Cap — Black', 'NR-CAP-BLK', 'accessories', 2, 8, 35, 'active'),
--   ('USER_ID_HERE', 'Noire Identity Hoodie — XL', 'NR-HOOD-XL', 'apparel', 1, 25, 85, 'active'),
--   ('USER_ID_HERE', 'Noire Sticker Pack', 'NR-STICK-01', 'print', 15, 1, 8, 'active');

-- Noire Leads
-- INSERT INTO public.noire_leads (user_id, name, contact, platform, interest, status, estimated_value, note)
-- VALUES
--   ('USER_ID_HERE', 'Marcus T.', '@marcust_ig', 'Instagram', 'Custom tee + cap', 'warm', 80, 'DM convo going — follow up Friday'),
--   ('USER_ID_HERE', 'Keisha Events', 'keisha@events.co', 'Email', 'Bulk order — event merch', 'hot', 450, 'Wants quote for 10 units');

-- Reminders
-- INSERT INTO public.reminders (user_id, title, body, due_at, priority, category)
-- VALUES
--   ('USER_ID_HERE', 'Certify Unemployment', 'Log in to PA UC portal and certify for the week', now() + interval '2 days', 'critical', 'income'),
--   ('USER_ID_HERE', 'LIHEAP Appointment', 'Bring: utility bills, ID, proof of income, lease', now() + interval '2 days', 'high', 'assistance'),
--   ('USER_ID_HERE', 'Contact Landlord re: Rent', 'Discuss payment plan or timeline', now() + interval '1 day', 'critical', 'housing'),
--   ('USER_ID_HERE', 'Follow up — Marcus T. (Noire)', 'Send him the tee + cap bundle pricing', now() + interval '3 days', 'medium', 'noire');

-- Car Issue (stored as home_issue or reminder)
-- INSERT INTO public.home_issues (user_id, title, description, category, priority, status)
-- VALUES
--   ('USER_ID_HERE', 'Car — Fuel Pump Replacement', 'Meineke quoted $980 for fuel pump. Car currently not running.', 'appliance', 'high', 'open');
