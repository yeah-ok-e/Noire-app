# LEGACY OS

**A Lewis Family Product • MMXXVI**

Private MVP web application for the Lewis family — an executive-grade life operating system covering finances, income, brand (Noire), artifacts, family, body, calendar, legacy, and administration.

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** (dark luxury design system)
- **Framer Motion** (animations)
- **Supabase** (Auth + Postgres + Storage + Realtime)
- **next-pwa** (PWA support, installable on iPhone)

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <repo-url>
cd Noire-app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Demo Mode**: If you leave the placeholder values, the app runs in Demo Mode — fully functional with localStorage, no Supabase required.

### 3. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your project dashboard
3. Run the contents of `supabase/schema.sql` to create all tables and RLS policies
4. (Optional) Run `supabase/seed.sql` after substituting your user ID for seed data

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

1. Push your code to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local`
4. Deploy — Vercel auto-detects Next.js

---

## PWA Install on iPhone

1. Open the app URL in Safari on iPhone
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add" — LEGACY OS will appear on your home screen
5. Open from home screen to run in standalone mode (full screen, no browser bar)

---

## Application Modules

| Route | Module | Description |
|-------|--------|-------------|
| `/` | Splash | Animated intro with compass |
| `/login` | Auth | Login with email/password or demo mode |
| `/command` | Command Board | Executive war room — cash, threats, moves |
| `/money` | Money | Bills, debts, cash tracking |
| `/income` | Income | Job applications, income sources, assistance |
| `/noire` | Noire HQ | Brand command center — inventory, leads, C-suite |
| `/artifacts` | Artifacts | Document vault with file upload |
| `/family` | Family & Home | Home issues, relationships, grocery, memories |
| `/body` | Body | Daily health log, stress/sleep tracking |
| `/calendar` | Calendar | Week view, event management |
| `/legacy` | Legacy | Life eras, journal entries, legacy score |
| `/admin` | Admin | Audit log, errors, AI controls, data export |

---

## Database Setup Steps

1. Create Supabase project
2. Copy connection details to `.env.local`
3. Run `supabase/schema.sql` in SQL Editor
4. Enable Row Level Security (already in schema)
5. Optionally run `supabase/seed.sql` with your user UUID

---

## Seed Data (Demo Mode)

The demo mode includes pre-loaded data matching the Lewis family situation:

- **Cash on Hand**: $234
- **Bills**: Rent ($1,100 overdue), Light Bill ($180 pending), Phone/Mary ($60 pending)
- **Debts**: Dana ($100), Reggie ($100), Mary ($60)
- **Car**: Meineke fuel pump quote $980
- **Income**: Unemployment (certify Tuesday, deposit Thursday)
- **Assistance**: LIHEAP appointment scheduled, Township app pending
- **Noire**: 4 inventory items, 2 leads (Marcus T. warm, Keisha Events hot)

---

## Design System

Dark luxury aesthetic. Color tokens:

| Token | Value | Usage |
|-------|-------|-------|
| background | `#080808` | App background |
| surface | `#111111` | Card backgrounds |
| surface-2 | `#1a1a1a` | Input backgrounds |
| border | `#222222` | Borders |
| text-primary | `#f0ede8` | Main text |
| text-secondary | `#888888` | Secondary text |
| text-muted | `#444444` | Muted/placeholder |
| accent | `#d4af7a` | Gold — active states, highlights |
| crisis | `#c0392b` | Red — threats, overdue items |

Fonts: **Inter** (UI), **Libre Baskerville** (headers/titles)

---

## Crisis Mode

Crisis mode activates automatically when:
- Cash drops below $500, OR
- Any rent bill is overdue, OR
- `profiles.crisis_mode` flag is set

When active: red banner displays, threat cards highlighted, critical actions surfaced.

---

## Architecture Notes

- **Demo Mode**: When `NEXT_PUBLIC_SUPABASE_URL` is placeholder, app uses `localStorage` for all data persistence. Fully functional offline.
- **Offline Support**: PWA with service worker, IndexedDB caching via `idb-keyval`, offline packet generation.
- **Auth**: Supabase SSR with middleware protection. In demo mode, auth is bypassed.
- **Audit Logging**: All mutations logged to `audit_logs` table (or localStorage in demo mode). Rollback available for bill status and cash changes.
