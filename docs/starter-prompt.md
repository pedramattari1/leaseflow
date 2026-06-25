# LeaseFlow — Starter Prompt

## What This Is

LeaseFlow is a web app that replaces a daily Excel-based leasing activity tracker used at a luxury high-rise residential building. The leasing team currently fills out an Excel sheet every day logging tour activity and application pipeline status, then emails it to the GM, who forwards it to regional management. This app eliminates that manual process with real-time data entry and a live shareable dashboard.

## Who Uses It

| Role | Description | Access |
|------|-------------|--------|
| **Agent** | Leasing admin / Head of Leasing. Logs tours, updates application statuses, adds notes. This is the primary daily user. | Full CRUD on tours and applications for their property |
| **Manager** | GM / Property Manager. Reviews daily activity, generates share links for management. | Everything Agent can do + user management + share link management |
| **Reviewer** | Regional management team. Views leasing metrics via a shared URL — no login required. | Read-only dashboard via token-based URL |

---

## Tech Stack

| Layer | Service |
|-------|---------|
| Frontend | React (Vite) + Tailwind CSS, deployed to Vercel |
| Backend | Node.js / Express, deployed to Railway |
| Database | PostgreSQL on Railway |
| Auth | Clerk (JWT verification) |
| Email | Resend |
| Scheduling | cron-job.org (external — hits API endpoints) |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| CSV Import | PapaParse |
| Monorepo | npm workspaces |

---

## Repo Structure

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
│   │   │   │   ├── SharedDashboard.jsx
│   │   │   │   ├── Units.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Login.jsx
│   │   │   ├── hooks/
│   │   │   ├── lib/
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
│       │   │   ├── auth.js
│       │   │   ├── roles.js
│       │   │   └── shareToken.js
│       │   ├── services/
│       │   │   ├── email.js
│       │   │   ├── digest.js
│       │   │   └── weeklyReport.js
│       │   ├── db/
│       │   │   ├── index.js
│       │   │   ├── schema.sql
│       │   │   └── seed.sql
│       │   └── index.js
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
└── package.json
```

---

## Database Schema

```sql
-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users (synced from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('agent', 'manager', 'reviewer')) DEFAULT 'agent',
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Units (property unit mix — reference data)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  floor INTEGER,
  market_rent DECIMAL(10,2),
  sqft INTEGER,
  status TEXT CHECK (status IN ('available', 'occupied', 'notice', 'down')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prospects (a person who tours — central entity linking tours and applications)
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profession TEXT,
  num_vehicles INTEGER DEFAULT 0,
  source TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tours (each tour visit — prospect can have multiple)
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
  effective_rent DECIMAL(10,2),
  budget DECIMAL(10,2),
  variance DECIMAL(10,2),
  comps_toured INTEGER DEFAULT 0,
  desired_term TEXT,
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
  lease_execution_target DATE,
  move_in_date DATE,
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline Stage History
CREATE TABLE pipeline_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard Share Links
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  label TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification Settings
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  daily_digest_enabled BOOLEAN DEFAULT true,
  daily_digest_time TEXT DEFAULT '18:00',
  weekly_report_enabled BOOLEAN DEFAULT true,
  weekly_report_day TEXT DEFAULT 'monday',
  pipeline_stall_days INTEGER DEFAULT 5,
  recipient_emails TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Routes

### Auth Middleware
- All `/api/*` routes require Clerk JWT except `/api/share/:token/*` routes
- `/api/share/:token/*` routes use `shareToken` middleware to validate token and attach property context

### Tours
- `GET /api/tours?date=YYYY-MM-DD&week=YYYY-MM-DD` — Get tours for a date or week
- `POST /api/tours` — Create a tour (also creates/links prospect)
- `PUT /api/tours/:id` — Update a tour
- `DELETE /api/tours/:id` — Delete a tour
- `GET /api/tours/summary?date=YYYY-MM-DD` — Status breakdown for a day
- `GET /api/tours/export?start=YYYY-MM-DD&end=YYYY-MM-DD` — CSV export

### Prospects
- `GET /api/prospects?search=query` — Search prospects by name
- `GET /api/prospects/:id` — Get prospect with tour history
- `PUT /api/prospects/:id` — Update prospect info

### Applications
- `GET /api/applications` — All active applications
- `POST /api/applications` — Create application (can auto-create from tour status change)
- `PUT /api/applications/:id` — Update application (stage change triggers history entry)
- `PUT /api/applications/:id/stage` — Move to new stage (with optional notes)
- `GET /api/applications/export` — CSV export

### Units
- `GET /api/units` — All units for property
- `POST /api/units` — Add a unit
- `PUT /api/units/:id` — Update a unit
- `DELETE /api/units/:id` — Delete a unit
- `POST /api/units/import` — CSV bulk import

### Dashboard
- `GET /api/dashboard/today` — Today's metrics (tour count, new apps, leases today)
- `GET /api/dashboard/weekly?week=YYYY-MM-DD` — Weekly data for charts
- `GET /api/dashboard/pipeline` — Pipeline summary (counts per stage, avg days)
- `GET /api/dashboard/funnel` — Conversion funnel data
- `GET /api/dashboard/velocity` — Leasing velocity (avg days tour → lease, trailing 30d)

### Share Links
- `POST /api/share` — Generate a share link (Manager only)
- `GET /api/share` — List share links
- `DELETE /api/share/:id` — Revoke a share link
- `GET /api/share/:token/dashboard` — Public dashboard data (no auth)

### Notifications
- `GET /api/notifications/settings` — Get notification settings
- `PUT /api/notifications/settings` — Update notification settings
- `POST /api/notifications/digest` — Trigger daily digest (called by cron)
- `POST /api/notifications/weekly` — Trigger weekly report (called by cron)

---

## Page Specs

### 1. Daily Log (`/tours`)
**Default view**: Today's tours, grouped under a date header.

**Layout**:
- Top bar: Date navigation (← Today →) + "Week of X/X" label + "New Tour" button
- Day tabs below: Mon | Tue | Wed | Thu | Fri | Sat | Sun (highlight current day)
- Tour table with columns matching the Excel: Name, Unit Type, Unit #, Market Rent, Concession, Effective Rent, Budget, Variance, Comps, Term, Profession, Vehicles, Status, Notes
- Status column uses color-coded badges: Hot (amber), Warm (blue), Cold (gray), Applied (green), Not Interested (red)
- Bottom: Status breakdown summary — row of counts: "Hot: 2 | Warm: 3 | Cold: 1 | Applied: 1 | Not Interested: 0 | Total: 7"
- Click any row to edit inline or open edit modal
- "New Tour" opens a slide-over panel from the right

**Tour Form (slide-over panel)**:
- Quick mode (default): Name, Unit Type (dropdown), Source (dropdown), Status (dropdown), Notes
- "Show All Fields" toggle expands to full form
- Unit # is a searchable dropdown — selecting a unit auto-fills Unit Type and Market Rent
- Effective Rent auto-computes when Market Rent or Concession changes
- Variance auto-computes when Effective Rent or Budget changes
- "Save & Add Another" button for rapid entry
- When status is set to "Applied", prompt: "Create application in pipeline?"

### 2. Pipeline (`/pipeline`)
**Two view modes**: Toggle between Table and Kanban at top right.

**Table view**: Columns — Name, Unit #, Unit Type, Market Rent, Stage, App Submitted, Approval Date, Lease Target Date, Days in Stage, Notes. Sortable by any column. Stage shown as color-coded badge.

**Kanban view**: Six columns — Applied | Screening | Approved | Lease Sent | Lease Executed | Move-in Scheduled. Each card shows: Name, Unit # + Type, Market Rent, days in stage, small note preview. Drag to move between columns. Drop triggers stage update + history log.

**Card detail**: Click a card/row to open detail panel showing full info + stage history timeline.

### 3. Dashboard (`/dashboard`)
**Layout** — a clean grid:
- Row 1 (3 metric cards): Tours Today, New Applications, Leases Executed This Week
- Row 2 (chart): Weekly tour activity — bar chart, Mon–Sun, current week vs prior week
- Row 3 (two columns):
  - Left: Pipeline summary — stage counts with horizontal bar segments
  - Right: Conversion funnel — Tours → Hot → Applied → Approved → Leased (with conversion % between each step)
- Row 4 (metric): Leasing Velocity — "Average X days from tour to lease execution (trailing 30 days)"

**Share button** in top right: opens modal to generate/manage share links.

### 4. Shared Dashboard (`/d/:token`)
**Public page** — no login, no sidebar, no navigation. Just the dashboard data scoped to the property linked to the token. Clean header with property name and "Live Leasing Metrics" label. Same data as the main dashboard. Auto-refreshes every 5 minutes.

### 5. Units (`/units`)
**Table**: Unit #, Type, Floor, Market Rent, Sqft, Status. Inline edit. Add button. CSV import button opens a modal with drag-and-drop upload + preview + column mapping.

### 6. Settings (`/settings`)
- **Share Links**: List active links, create new, revoke existing
- **Notifications**: Toggle daily digest, weekly report, pipeline stall alerts. Set recipient emails. Set timing.
- **Users**: List users, invite new (Manager only), change roles

---

## Design Tokens

```
Colors:
  background: #FAFAFA
  surface: #FFFFFF
  primary: #2563EB
  primary-hover: #1D4ED8
  success: #16A34A
  warning: #F59E0B
  danger: #DC2626
  text-primary: #111827
  text-secondary: #6B7280
  border: #E5E7EB

Font: Inter (Google Fonts)

Status Colors:
  hot: #F59E0B (amber)
  warm: #3B82F6 (blue)
  cold: #9CA3AF (gray)
  applied: #16A34A (green)
  not_interested: #DC2626 (red)

Pipeline Stage Colors:
  applied: #3B82F6
  screening: #8B5CF6
  approved: #16A34A
  lease_sent: #F59E0B
  lease_executed: #059669
  move_in_scheduled: #0891B2

Border radius: 8px (cards), 6px (inputs/buttons), 4px (badges)
```

---

## Environment Variables

### Frontend (`apps/web/.env`)
```
VITE_API_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

### Backend (`apps/api/.env`)
```
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/leaseflow
CLERK_SECRET_KEY=sk_test_xxx
CLERK_PUBLISHABLE_KEY=pk_test_xxx
RESEND_API_KEY=re_xxx
CRON_SECRET=xxx
CORS_ORIGIN=http://localhost:5173
```

---

## Build Phases

### Phase 1 — Foundation
Scaffold monorepo. Set up Vite + React + Tailwind in `apps/web`. Set up Express in `apps/api`. Connect to PostgreSQL on Railway. Run `schema.sql` to create all 8 tables. Integrate Clerk for auth (sign-in page, JWT middleware, Clerk webhook to sync users to DB). Build the layout shell (sidebar with nav links, header with user name, mobile hamburger menu). Seed one property ("The Fay San Jose") and seed sample unit data. Deploy frontend to Vercel, backend to Railway. Verify login works end-to-end.

### Phase 2 — Units + Tour Log
Build the Units page: CRUD table, CSV import via PapaParse with preview modal and column mapping. Build the Daily Log page: day tabs, tour table, status badges, summary row. Build the tour form slide-over: quick mode + full mode, searchable unit dropdown with auto-fill, auto-computed fields, "Save & Add Another". When status changes to "Applied", prompt to create an application. Test: import units via CSV, log 5 tours, verify summary counts.

### Phase 3 — Pipeline
Build Pipeline page with table view first (match Excel columns). Add Kanban view with @hello-pangea/dnd. Stage transitions trigger pipeline_history entries. Days-in-stage counter. Click-to-open detail panel with stage history timeline. Auto-create application when tour status set to "Applied". Test: create applications, drag through pipeline, verify history log.

### Phase 4 — Dashboard + Sharing
Build Dashboard page with metric cards, weekly bar chart (Recharts), pipeline summary, conversion funnel. Build share link generation and management. Build SharedDashboard public page (token-based, no auth). Add auto-refresh on shared dashboard. Test: generate link, verify in incognito, check data accuracy.

### Phase 5 — Notifications
Resend integration. Daily digest endpoint (POST /api/notifications/digest). Weekly report endpoint. Pipeline stall detection query. Lease deadline reminder. Notification settings page. Wire up cron-job.org to call endpoints. Test: trigger digest manually, verify email content.

### Phase 6 — Polish
Mobile optimization (especially tour form). Search across prospects. CSV export for tours and pipeline. Keyboard shortcuts. Loading/error/empty states. Sentry integration. Performance review.

---

## Concession Calculator & Lender Compliance

### Business Logic
The tour form includes a built-in concession calculator that computes concessions as weekly spreads (not monthly) and validates against lender-mandated rent floors.

**Concession formula** (annualized weekly spread):
```
concession_total = (market_rent × 12) / 52 × weeks_of_concession
```

**Net effective rent**:
```
net_effective_rent = market_rent - (concession_total / lease_term_months)
```

**Concession options**: 0, 2, 4, 6, or 8 weeks (dropdown selector).

**Lease term minimums** (by concession level):
| Concession | Min Lease Term |
|-----------|---------------|
| 2 weeks   | 12 months     |
| 4 weeks   | 12 months     |
| 6 weeks   | 13 months     |
| 8 weeks   | 14 months     |

If the lease term is below the minimum, a **yellow warning** is shown. This is advisory, not blocking.

### Exhibit G — Rent Floors (Lender Agreement)
The `rent_floors` table stores minimum gross rents per unit code from the lender agreement (Exhibit G). If the net effective rent falls below the floor, a **red warning** is shown: "Below minimum gross rent of $X,XXX for [unit_code] per lender agreement." This is also advisory, not blocking.

| Unit Code | Min Gross Rent |
|-----------|---------------|
| Studio B  | $2,795        |
| Studio A  | $2,950        |
| 1BR-A     | $3,450        |
| 1BR-C     | $3,310        |
| 1BR-B     | $3,690        |
| 1BR-D     | $4,250        |
| 2BR-B     | $4,465        |
| 2BR-A     | $4,420        |
| 2BR-D     | $4,500        |
| 2BR-C     | $4,640        |
| 2BR-F     | $6,025        |

### Database
- `rent_floors` table: `unit_code`, `min_gross_rent`, linked to `property_id`
- `units.unit_code` column maps units to their Exhibit G entry
- `tours.concession_weeks` stores the selected weeks (0/2/4/6/8)
- `tours.concession` stores the computed dollar amount
- API endpoint: `GET /api/units/rent-floors`
