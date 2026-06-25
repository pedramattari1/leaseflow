# LeaseFlow — Task Tracker

## Phase 1 — Foundation ✅
- [x] Scaffold monorepo (npm workspaces)
- [x] Set up Vite + React + Tailwind in apps/web
- [x] Set up Express in apps/api
- [x] Configure Tailwind with design system tokens
- [x] Add CSS custom properties
- [x] Create database schema (all 8 tables)
- [x] Create seed data
- [x] Add Clerk auth integration (frontend + backend middleware)
- [x] Build layout shell (Sidebar, MobileNav, Layout)
- [x] Create placeholder pages for all routes
- [x] Verified in browser

## Phase 2 — Units + Tour Log ✅
- [x] API: units CRUD + CSV import endpoint
- [x] API: tours CRUD + summary endpoint
- [x] API: prospects search endpoint
- [x] Frontend: shared components (StatusBadge, SlideOver, Modal, SearchableDropdown)
- [x] Frontend: Units page with table, add/edit form, delete confirmation, CSV import
- [x] Frontend: Daily Log with day tabs, tour table, summary row, slide-over form
- [x] Frontend: Tour form with quick/full mode, auto-computed fields, unit auto-fill
- [x] Frontend: "Applied" status → pipeline prompt
- [x] Data hooks (useUnits, useTours)
- [x] Verified: units table, tour creation, summary counts, auto-compute

## Phase 3 — Pipeline ✅
- [x] API: applications CRUD + stage move + history endpoint
- [x] Frontend: Pipeline page with Table/Kanban toggle
- [x] Frontend: PipelineTable with sortable columns
- [x] Frontend: KanbanBoard with @hello-pangea/dnd drag-and-drop
- [x] Frontend: AppCard with stage badge and days counter
- [x] Frontend: AppDetail slide-over with stage history timeline
- [x] Data hook (useApplications)
- [x] Verified: kanban view, stage transitions, history timeline

## Phase 4 — Dashboard + Sharing ✅
- [x] Dashboard API: today metrics, weekly chart, pipeline summary, funnel, velocity
- [x] Dashboard page with MetricCards, WeeklyChart (Recharts), PipelineSummary, ConversionFunnel, VelocityCard
- [x] Share link CRUD API with token-based access
- [x] ShareModal for creating/revoking/copying share links
- [x] SharedDashboard public page with auto-refresh (5 min), no auth required

## Phase 5 — Notifications ✅
- [x] Email service stubbed with console.log (ready for Resend swap)
- [x] Daily digest endpoint with tour counts, status breakdown, pipeline stalls
- [x] Weekly report endpoint with week-over-week comparison
- [x] Notification settings API (GET/PUT with upsert)
- [x] Settings page with Share Links, Notifications, and Users tabs

## Phase 6 — Polish ✅
- [x] Mobile optimization: TourForm single-col at 375px, all page headers stack on mobile, Layout padding reduced
- [x] Global prospect search: Cmd+K CommandPalette with debounced search via /api/prospects
- [x] CSV export: tours and pipeline export endpoints, Export buttons on both pages
- [x] Keyboard shortcuts: Cmd+N new tour (on /tours), Cmd+K search (global)
- [x] Loading/error/empty states: LoadingSpinner, ErrorBanner with retry, error state in all hooks
