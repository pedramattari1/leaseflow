# LeaseFlow — Platform Plan

## The Problem

You and the head of leasing manually fill out an Excel sheet every day — logging tours, tracking prospect details (unit type, budget, move-in date, source, notes), and monitoring application pipeline status. Then you email that file to your GM, who shares it up to the regional management team. It's slow, error-prone, and creates version chaos. Management wants two things on a daily/live basis:

1. **Daily Tours** — with notes: unit type, budget, estimated move-in date, source, additional comments
2. **Current Applications** — in progress, status updates, lease executed by date

The Excel tracker has two sheets:
- **Daily Prospect Log** — organized by day of week, with columns: Name, Unit Type, Unit #, Market Rent, Concession, Effective Rent, Budget, Variance, Comps Toured, Desired Term, Profession, # of Vehicles, Status (Hot/Warm/Cold/Applied/Not Interested), Notes. Plus a status breakdown summary at the bottom.
- **Pipeline Tracker** — columns: Name, Unit #, Unit Type, Market Rent, Pipeline Stage, App Submitted, Approval Date, Notes

---

## Platform Overview: LeaseFlow

A lightweight web app that replaces the daily Excel tracker with real-time data entry for the leasing team and a live read-only dashboard for management. No more emailing attachments. Management gets a persistent link they bookmark and check whenever they want.

---

## Users & Roles

| Role | Who | What they do |
|------|-----|-------------|
| **Leasing Agent** | You, Head of Leasing | Log tours, add prospect details, update application statuses, add notes |
| **Property Manager / GM** | Darren | Reviews daily activity, shares link with management, can view everything |
| **Regional Reviewer** | Management team | Views leasing metrics across properties via shared dashboard link, read-only |

Role permissions:
- **Agent**: Full CRUD on tours and applications for their property
- **Manager**: Everything Agent can do + view summary dashboards + manage users for their property
- **Reviewer**: Read-only access to dashboards and reports (could be a simple shared link with a token, no login required)

---

## Core Features

### 1. Daily Tour Log (replaces "Daily Prospect Log" sheet)

**The input form** — designed for speed. You're on the phone or just finished a tour, you need to log it in 30 seconds:
- Prospect name (text)
- Unit type (dropdown — Studio, 1BR, 2BR, etc., pulled from your property's unit mix)
- Unit # (searchable dropdown — auto-fills Market Rent when selected)
- Market Rent (auto-filled from unit data, editable)
- Concession (dollar amount input)
- Effective Rent (auto-calculated: Market Rent - Concession)
- Budget (what the prospect said their budget is)
- Variance (auto-calculated: Effective Rent - Budget)
- Comps Toured (number)
- Desired Lease Term (dropdown: 6mo, 12mo, 13mo, 14mo, etc.)
- Profession (text)
- # of Vehicles (number)
- Source (dropdown: Zillow, Apartments.com, Walk-in, Referral, Website, Other)
- Estimated Move-in Date (date picker)
- Status (dropdown: Hot, Warm, Cold, Applied, Not Interested)
- Notes (text area)

**Smart features to save you time:**
- **Quick-add mode**: A streamlined form that only shows Name, Unit Type, Source, Status, and Notes — expandable to full form for detailed entries
- **Duplicate from previous**: If same prospect comes back for a second tour, one click to pull their previous info
- **Today's view as default**: Opens to today's log, with day tabs just like the Excel sheet (Mon–Sun)
- **Auto-save drafts**: Typing but need to grab a call? It saves where you left off
- **Bulk status update**: Select multiple prospects, change status in one action

**Daily summary** — auto-generated at bottom of each day:
- Total tours today
- Status breakdown (Hot/Warm/Cold/Applied/Not Interested counts)
- Conversion funnel: Tours → Applied → Leased

### 2. Application Pipeline (replaces "Pipeline Tracker" sheet)

**Kanban board view** with columns:
- Applied → Screening → Approved → Lease Sent → Lease Executed → Move-in Scheduled

Each card shows: Name, Unit #, Unit Type, Market Rent, date entered stage, days in stage

**Or table view** (for people who prefer the Excel feel) with columns matching the original: Name, Unit #, Unit Type, Market Rent, Pipeline Stage, App Submitted, Approval Date, Lease Execution Date, Notes

**Key features:**
- Drag-and-drop between pipeline stages (Kanban view)
- When a prospect is marked "Applied" in the tour log, they auto-populate into the pipeline
- "Lease Executed by Date" field with deadline tracking
- Days-in-stage counter so you can spot stalled applications
- Notes per stage transition (e.g., "Waiting on guarantor docs")

### 3. Management Dashboard (the "live link" management wants)

A clean, read-only view accessible via a shared URL (token-based, no login needed for reviewers). This is what replaces the daily email attachment.

**What it shows:**
- **Today's Activity**: Tour count, new applications, leases executed today
- **This Week at a Glance**: Daily tour counts (Mon–Sun), weekly total, comparison to prior week
- **Pipeline Summary**: How many prospects at each stage, how many days avg per stage
- **Status Funnel**: Visual funnel — Tours → Hot Leads → Applied → Approved → Leased
- **Leasing Velocity**: Avg days from tour to lease execution (trailing 30 days)
- **Weekly Trend Chart**: Tours per day for the current and prior week (simple line or bar chart)

**Shareable**: GM gets a URL like `app.leaseflow.com/dashboard/abc123` that he bookmarks or drops in a Slack/email once. Management checks it whenever — always current data, never stale.

### 4. Unit Directory (reference data)

A simple settings page where you load your property's unit mix once:
- Unit #, Unit Type, Floor, Market Rent, Square Footage, Status (Available/Occupied/Notice)
- This powers the dropdowns in the tour log and pipeline
- CSV import for initial setup (you probably have this in a spreadsheet already)
- Manual add/edit for changes

### 5. Weekly Report (auto-generated)

Every Monday morning, the system compiles the prior week's data into a clean summary and either:
- Emails it to a distribution list (GM + management team) via Resend
- Or just makes it available on the dashboard with a "Week of X" selector

Contents: total tours, conversion rates, pipeline movement, leases executed, notable prospects (Hot leads).

### 6. Notifications (optional but useful)

- **Daily digest email** to GM at 6 PM: "Today: 4 tours, 1 new application, 0 leases executed" with a link to the dashboard
- **Pipeline alerts**: "Application for [Name] has been in Screening for 5+ days"
- **Lease deadline reminder**: "Lease for [Name] — Unit 1205 — target execution date is tomorrow"

All via Resend, triggered by cron jobs.

---

## Tech Stack

| Layer | Service | Why |
|-------|---------|-----|
| **Frontend** | React (Vite) on Vercel | Fast, you know it, free hosting tier |
| **Backend** | Node.js/Express on Railway | Your proven pattern from PostBuild/ParkingManager |
| **Database** | PostgreSQL on Railway | Same, battle-tested |
| **Auth** | Clerk | Multi-role support, fast setup, you've used it before |
| **Email** | Resend | Daily digests, weekly reports, pipeline alerts |
| **Scheduling** | cron-job.org | Trigger daily digest and weekly report emails |
| **Charts** | Recharts | Dashboard visualizations, you've used it in PostBuild |
| **Drag & Drop** | @hello-pangea/dnd (or dnd-kit) | Kanban board for pipeline |
| **CSV Import** | PapaParse | Unit directory bulk import |
| **Shared Links** | UUID tokens in DB | Reviewer dashboard access without login |

**No Procore, no Appfolio integration** — this is standalone. Data entry is manual but fast because the UI is designed for it.

---

## Database Schema

```sql
-- Properties (supports future multi-property if management wants)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users (mirrored from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('agent', 'manager', 'reviewer')) DEFAULT 'agent',
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Units (reference data — the property's unit mix)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL,          -- Studio, 1BR, 2BR, etc.
  floor INTEGER,
  market_rent DECIMAL(10,2),
  sqft INTEGER,
  status TEXT CHECK (status IN ('available', 'occupied', 'notice', 'down')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prospects (a person who toured — central entity)
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profession TEXT,
  num_vehicles INTEGER DEFAULT 0,
  source TEXT,                      -- Zillow, Apartments.com, Walk-in, etc.
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tours (each tour visit — a prospect can have multiple)
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tour_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  unit_type TEXT,
  unit_number TEXT,
  market_rent DECIMAL(10,2),
  concession DECIMAL(10,2) DEFAULT 0,
  effective_rent DECIMAL(10,2),     -- computed: market_rent - concession
  budget DECIMAL(10,2),
  variance DECIMAL(10,2),           -- computed: effective_rent - budget
  comps_toured INTEGER DEFAULT 0,
  desired_term TEXT,                -- "12 months", "6 months", etc.
  estimated_move_in DATE,
  status TEXT CHECK (status IN ('hot', 'warm', 'cold', 'applied', 'not_interested')) DEFAULT 'warm',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Applications (pipeline tracking)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  unit_type TEXT,
  unit_number TEXT,
  market_rent DECIMAL(10,2),
  pipeline_stage TEXT CHECK (pipeline_stage IN (
    'applied', 'screening', 'approved', 'lease_sent', 'lease_executed', 'move_in_scheduled'
  )) DEFAULT 'applied',
  app_submitted_date DATE,
  approval_date DATE,
  lease_execution_date DATE,
  lease_execution_target DATE,      -- the "by date" management wants
  move_in_date DATE,
  stage_entered_at TIMESTAMPTZ DEFAULT now(),  -- when current stage was entered
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline Stage History (audit trail for stage transitions)
CREATE TABLE pipeline_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard Share Links (token-based access for reviewers)
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  label TEXT,                       -- "Management Dashboard"
  expires_at TIMESTAMPTZ,           -- optional expiry
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification Preferences
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  daily_digest_enabled BOOLEAN DEFAULT true,
  daily_digest_time TEXT DEFAULT '18:00',
  weekly_report_enabled BOOLEAN DEFAULT true,
  weekly_report_day TEXT DEFAULT 'monday',
  pipeline_stall_days INTEGER DEFAULT 5,
  recipient_emails TEXT[],          -- array of emails to receive notifications
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

8 tables. Clean, normalized, no bloat.

---

## Folder Structure

```
leaseflow/
├── apps/
│   ├── web/                        # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/         # Sidebar, Header, MobileNav
│   │   │   │   ├── tours/          # TourForm, TourTable, TourDayTabs, QuickAdd
│   │   │   │   ├── pipeline/       # KanbanBoard, PipelineTable, AppCard, StageColumn
│   │   │   │   ├── dashboard/      # MetricCard, WeeklyChart, FunnelChart, PipelineSummary
│   │   │   │   ├── units/          # UnitTable, UnitForm, CSVImport
│   │   │   │   ├── settings/       # ShareLinks, NotificationSettings, UserManagement
│   │   │   │   └── shared/         # StatusBadge, DatePicker, SearchableDropdown, Modal
│   │   │   ├── pages/
│   │   │   │   ├── DailyLog.jsx
│   │   │   │   ├── Pipeline.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── SharedDashboard.jsx   # Public token-based view
│   │   │   │   ├── Units.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Login.jsx
│   │   │   ├── hooks/              # useProperty, useTours, usePipeline, useDashboard
│   │   │   ├── lib/                # api.js, utils.js, constants.js
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── api/                        # Node.js/Express backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── tours.js
│       │   │   ├── prospects.js
│       │   │   ├── applications.js
│       │   │   ├── units.js
│       │   │   ├── dashboard.js
│       │   │   ├── share.js
│       │   │   └── notifications.js
│       │   ├── middleware/
│       │   │   ├── auth.js          # Clerk JWT verification
│       │   │   ├── roles.js         # Role-based access control
│       │   │   └── shareToken.js    # Token validation for public dashboard
│       │   ├── services/
│       │   │   ├── email.js         # Resend integration
│       │   │   ├── digest.js        # Daily digest generator
│       │   │   └── weeklyReport.js  # Weekly report generator
│       │   ├── db/
│       │   │   ├── index.js         # pg Pool connection
│       │   │   ├── schema.sql       # All CREATE TABLE statements
│       │   │   └── seed.sql         # Sample data for development
│       │   └── index.js             # Express app entry point
│       └── package.json
│
├── tasks/
│   ├── todo.md
│   └── lessons.md
│
├── docs/
│   ├── claude.md
│   ├── starter-prompt.md
│   ├── api.md
│   └── schema.md
│
├── .gitignore
├── README.md
└── package.json                    # Monorepo root (npm workspaces)
```

---

## Phased Build Plan

### Phase 1 — Foundation
- Monorepo scaffolding (npm workspaces, Vite, Express)
- PostgreSQL connection on Railway
- Clerk auth integration (sign-up, sign-in, JWT middleware)
- Create all 8 database tables
- Basic layout shell: sidebar nav, header with user info, mobile responsive
- Seed one property ("The Fay San Jose") and one admin user
- Deploy: frontend to Vercel, backend to Railway
- **Test**: Can log in, see empty dashboard, nav works

### Phase 2 — Unit Directory + Tour Log
- Unit directory CRUD: add/edit/delete units, CSV import via PapaParse
- Tour log form: full form with all fields, auto-fill Market Rent from unit selection
- Quick-add mode (collapsed form with essential fields only)
- Day tabs (Mon–Sun) with date navigation (this week / previous weeks)
- Tour table view grouped by day
- Auto-computed fields: Effective Rent, Variance
- Status breakdown summary per day (Hot/Warm/Cold/Applied/Not Interested counts)
- Prospect deduplication: if same name exists, prompt to link or create new
- **Test**: Can import units via CSV, log a tour in under 30 seconds, see today's summary

### Phase 3 — Application Pipeline
- Pipeline table view with all columns from the Excel tracker
- Kanban board view with drag-and-drop stage transitions
- Toggle between table and Kanban views
- Auto-create application when tour status set to "Applied"
- Stage transition history (pipeline_history table)
- Days-in-stage counter per application
- Lease execution target date with visual indicator (on track / overdue)
- Stage-level notes
- **Test**: Mark a prospect as Applied, see them appear in pipeline, drag through stages

### Phase 4 — Management Dashboard + Shared Links
- Dashboard page with: today's activity, weekly tour chart (Recharts), pipeline summary, conversion funnel
- Week-over-week comparison
- Leasing velocity metric (avg days tour → lease)
- Share link generation: create token-based URL for reviewers
- Public SharedDashboard page: no login required, reads from token, shows read-only dashboard
- Share link management: create, revoke, set expiry
- **Test**: Generate a share link, open in incognito, see live dashboard data

### Phase 5 — Notifications + Weekly Report
- Resend integration for transactional email
- Daily digest email: triggered by cron-job.org at 6 PM, sends day's summary to configured recipients
- Weekly report email: triggered Monday morning, compiles prior week's data
- Pipeline stall alert: if application sits in a stage for X+ days, email the leasing team
- Lease deadline reminder: email when target execution date is approaching
- Notification settings page: configure recipients, toggle on/off, set timing
- **Test**: Trigger a manual digest, verify email arrives with correct data

### Phase 6 — Polish + UX
- Mobile-optimized tour entry (this is critical — you'll log tours on your phone)
- Keyboard shortcuts: Cmd+N for new tour, Cmd+K for search
- Search across prospects/tours/applications
- CSV export for tours and pipeline (for anyone who still wants spreadsheets)
- Loading states, error handling, empty states with clear CTAs
- Sentry error tracking
- **Test**: Full workflow on mobile — log tour, check pipeline, view dashboard

---

## Design Direction

**Audience**: Property management professionals who need to move fast. Not a consumer app — it's a work tool.

**Aesthetic**: Clean, data-dense without feeling cluttered. Think Linear or Notion — neutral backgrounds, clear hierarchy, generous whitespace around dense data tables. Not playful, not corporate-stiff. Professional and fast.

**Palette**:
- Background: `#FAFAFA` (light neutral)
- Surface/Cards: `#FFFFFF`
- Primary: `#2563EB` (blue — action buttons, active states)
- Success: `#16A34A` (green — approved, lease executed)
- Warning: `#F59E0B` (amber — overdue, stalled)
- Danger: `#DC2626` (red — not interested, expired)
- Text: `#111827` primary, `#6B7280` secondary

**Typography**: Inter for everything — it's the workhorse of SaaS tools, legible at small sizes in data tables.

**Key UX principles**:
- Today's log is the home screen. You open the app, you see today.
- One-click to start logging a tour.
- Status colors are consistent everywhere (Hot = amber, Warm = blue, Cold = gray, Applied = green, Not Interested = red).
- The dashboard is glanceable — a GM should understand the day's activity in 5 seconds.
- Mobile-first for tour entry. Desktop-first for dashboard/pipeline.

---

## Smart Integrations Worth Considering

**For later phases (not MVP):**
- **Twilio / SMS**: Text prospects follow-up reminders
- **Google Calendar API**: Auto-create calendar events for scheduled tours
- **Slack webhook**: Post daily summary to a Slack channel instead of (or in addition to) email
- **Appfolio API** (if they ever open one): Pull unit availability and rent data automatically
- **AI-assisted notes**: Use Claude API to summarize tour notes into structured data or generate follow-up email drafts
