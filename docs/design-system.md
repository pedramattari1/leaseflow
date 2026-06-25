# LeaseFlow — Design System

This document defines every visual decision for LeaseFlow. Follow it exactly. Do not deviate, improvise, or fall back to generic Tailwind defaults unless this document says to.

---

## Design Philosophy

LeaseFlow is a daily-use work tool for a luxury residential property. The design must do two things simultaneously: feel fast and effortless for the leasing team who use it 20+ times a day, and look polished and credible when management opens the shared dashboard link. The interface should feel like a premium tool — quiet confidence, not flashy.

**Guiding principles:**
- **Density with breathing room**: Data tables and forms are the core UI. Pack information tightly but use generous padding inside cells and between sections so nothing feels cramped.
- **Quiet luxury**: Subtle shadows over hard borders. Warm neutrals over cold grays. Refined type hierarchy over bold color blocks. The design should feel expensive without trying to look expensive.
- **Speed over exploration**: Every interaction should be fast. Default views, pre-filled fields, keyboard shortcuts. The user knows what they need to do — get out of their way.
- **Consistency is trust**: Same patterns everywhere. Same badge styles, same spacing, same interaction patterns. If a status badge looks one way on the tour log, it looks identical on the pipeline and dashboard.

---

## Color System

### Core Palette

```
--color-bg:             #F8F7F4       /* Warm off-white — the canvas */
--color-surface:        #FFFFFF       /* Cards, panels, table backgrounds */
--color-surface-hover:  #F5F4F1       /* Table row hover, subtle hover state */
--color-surface-active: #EFEEE9       /* Selected/active state backgrounds */

--color-border:         #E8E6E1       /* Card borders, dividers, table lines */
--color-border-subtle:  #F0EFEB       /* Inner dividers, section separators */

--color-text-primary:   #1A1A1A       /* Headings, table cell text, input values */
--color-text-secondary: #6B6B6B       /* Labels, helper text, timestamps */
--color-text-tertiary:  #9B9B9B       /* Placeholders, disabled text */
```

### Brand Colors

```
--color-primary:        #1E3A5F       /* Deep navy — primary buttons, active nav, links */
--color-primary-hover:  #162D4A       /* Primary button hover */
--color-primary-light:  #E8EEF4       /* Primary tint — selected nav item bg, subtle highlights */

--color-accent:         #C4A265       /* Muted champagne gold — premium accent, sparingly */
--color-accent-light:   #F5F0E6       /* Accent tint — special callouts */
```

### Semantic Colors

```
/* Status — used for prospect/tour status badges */
--color-hot:            #D97706       /* Amber — hot prospect */
--color-hot-bg:         #FEF3C7
--color-warm:           #2563EB       /* Blue — warm prospect */
--color-warm-bg:        #DBEAFE
--color-cold:           #9CA3AF       /* Gray — cold prospect */
--color-cold-bg:        #F3F4F6
--color-applied:        #059669       /* Emerald — applied */
--color-applied-bg:     #D1FAE5
--color-not-interested: #DC2626       /* Red — not interested */
--color-not-interested-bg: #FEE2E2

/* Pipeline stages */
--color-stage-applied:     #2563EB
--color-stage-screening:   #7C3AED
--color-stage-approved:    #059669
--color-stage-lease-sent:  #D97706
--color-stage-executed:    #047857
--color-stage-move-in:     #0E7490

/* Feedback */
--color-success:        #059669
--color-success-bg:     #D1FAE5
--color-warning:        #D97706
--color-warning-bg:     #FEF3C7
--color-error:          #DC2626
--color-error-bg:       #FEE2E2
```

### Usage Rules

- `--color-bg` is the page background. Always. Never use pure white (`#FFFFFF`) as a page background.
- `--color-surface` is for elevated elements: cards, slide-over panels, modals, dropdowns, table containers. The contrast between `#F8F7F4` and `#FFFFFF` creates depth without heavy shadows.
- Borders are `--color-border` at `1px`. Never use black borders. Never use borders thicker than `1px` except for focused input states.
- The gold accent (`--color-accent`) is used only for: the logo mark, the "LeaseFlow" wordmark, metric highlights on the shared dashboard, and active week indicator. Do not use it for buttons, links, or badges.
- Primary navy (`--color-primary`) is the action color: primary buttons, active sidebar nav item, links, and focus rings.

---

## Typography

### Font Stack

```
--font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Use Plus Jakarta Sans for everything. Load weights 400, 500, 600, and 700 from Google Fonts. Do not use Inter, Roboto, or system fonts as the visible font — Plus Jakarta Sans is the brand typeface.

### Type Scale

```
--text-xs:    0.75rem / 1rem      (12px — timestamps, badge text, helper text)
--text-sm:    0.8125rem / 1.25rem (13px — table cells, secondary labels, nav items)
--text-base:  0.875rem / 1.5rem   (14px — body text, form inputs, primary labels)
--text-lg:    1rem / 1.5rem       (16px — card titles, section headers)
--text-xl:    1.25rem / 1.75rem   (20px — page titles)
--text-2xl:   1.5rem / 2rem       (24px — dashboard metric numbers)
--text-3xl:   2rem / 2.5rem       (32px — large dashboard hero numbers)
```

### Weight Usage

- **400 Regular**: Body text, table cell values, input text
- **500 Medium**: Labels, nav items, secondary headings, table headers
- **600 SemiBold**: Card titles, section titles, button text, metric labels
- **700 Bold**: Page titles, large dashboard numbers only

### Rules

- Default body text is `text-base` (14px) weight 400. This is smaller than most apps — it keeps tables dense and professional.
- Table cell text is `text-sm` (13px) weight 400. Table headers are `text-sm` weight 500, uppercase letterspaced (`tracking-wider`).
- Never use font sizes larger than `text-3xl` (32px) anywhere in the app.
- Use `tabular-nums` (`font-variant-numeric: tabular-lining`) on any column that contains numbers — rents, counts, variances, dates. This aligns digits in table columns.
- Line heights are already specified in the scale above. Do not override them.

---

## Spacing System

Use a base-4 scale. These are the only spacing values allowed:

```
4px   (1)   — inner padding on tight elements (badge padding-x)
8px   (2)   — gap between inline elements, icon-to-text gap
12px  (3)   — small section padding, compact card padding
16px  (4)   — standard input padding, card padding, table cell padding-y
20px  (5)   — gap between form fields
24px  (6)   — section spacing within a page, card padding on dashboard
32px  (8)   — spacing between page sections
48px  (12)  — major section breaks, top/bottom page padding
```

### Spacing Rules

- Sidebar width: `240px` on desktop. Collapsible on tablet/mobile.
- Page content max-width: `1280px`, centered, with `24px` horizontal padding.
- Cards: `24px` internal padding, `16px` gap between cards in a grid.
- Table rows: `12px` vertical padding, `16px` horizontal padding per cell.
- Form fields: `20px` gap between fields vertically. Labels sit `6px` above their input.
- Slide-over panel width: `480px` on desktop, full-width on mobile.

---

## Border Radius

```
--radius-sm:   4px    — badges, chips, small tags
--radius-md:   8px    — inputs, buttons, dropdowns
--radius-lg:   12px   — cards, panels, modals
--radius-xl:   16px   — dashboard metric cards, large containers
```

### Rules

- All cards use `--radius-lg` (12px).
- All inputs and buttons use `--radius-md` (8px).
- Status badges use `--radius-sm` (4px) — they should feel compact, not pill-shaped.
- Never use fully rounded (`9999px`) on anything except avatar circles.

---

## Shadows

```
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.04)                              — table container, subtle elevation
--shadow-md:   0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)   — cards, dropdowns
--shadow-lg:   0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)   — slide-over panels, modals
--shadow-xl:   0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)   — mobile menu overlay
```

### Rules

- Shadows are the primary elevation mechanism. Prefer shadow over border for cards.
- Cards on the dashboard: `--shadow-md`.
- Slide-over panel: `--shadow-lg`.
- Dropdowns and popovers: `--shadow-md`.
- Table containers: `--shadow-sm` with `1px` border in `--color-border`. Tables get both shadow AND border because they're dense.
- Never use colored shadows or high-opacity shadows.

---

## Component Specifications

### Sidebar Navigation

```
Width: 240px
Background: --color-surface (#FFFFFF)
Border-right: 1px solid --color-border
```

- Logo area at top: 48px tall, "LeaseFlow" in `text-lg` weight 600 color `--color-primary`, with a small gold accent mark before it.
- Nav items: `text-sm` weight 500, `12px` vertical padding, `16px` horizontal padding, `--color-text-secondary` default color.
- Active nav item: `--color-primary` text, `--color-primary-light` background, `--radius-md` rounding, `2px` left border in `--color-primary`.
- Hover (non-active): `--color-surface-hover` background.
- Nav icons: 18px, stroke weight 1.5 (Lucide icons), same color as text. Placed `8px` before label.
- Nav groups: "MAIN" (Tours, Pipeline, Dashboard), "MANAGE" (Units, Settings). Group labels in `text-xs` weight 600 uppercase, `--color-text-tertiary`, `24px` top margin.
- Bottom of sidebar: User name in `text-sm` weight 500, email in `text-xs` weight 400 `--color-text-secondary`. Sign out link.

### Mobile Navigation

- Sidebar collapses to hidden below `1024px`.
- Top bar appears: 56px tall, `--color-surface` bg, left hamburger icon, center "LeaseFlow" text, right user avatar.
- Hamburger opens sidebar as a slide-over from left with `--shadow-xl` and a semi-transparent backdrop.

### Buttons

**Primary** (main actions: "New Tour", "Save", "Generate Link"):
```
Background: --color-primary
Text: #FFFFFF
Font: text-sm weight 600
Padding: 10px 20px
Radius: --radius-md (8px)
Hover: --color-primary-hover
Transition: background 150ms ease
```

**Secondary** (cancel, alternative actions):
```
Background: transparent
Border: 1px solid --color-border
Text: --color-text-primary
Font: text-sm weight 500
Padding: 10px 20px
Radius: --radius-md (8px)
Hover: --color-surface-hover background
```

**Ghost** (inline actions, icon buttons):
```
Background: transparent
Text: --color-text-secondary
Font: text-sm weight 500
Padding: 8px 12px
Radius: --radius-md (8px)
Hover: --color-surface-hover background
```

**Destructive** (delete, revoke):
```
Background: transparent
Border: 1px solid --color-error
Text: --color-error
Font: text-sm weight 500
Padding: 10px 20px
Radius: --radius-md (8px)
Hover: --color-error-bg background
```

- All buttons: `cursor-pointer`, `transition: all 150ms ease`.
- Disabled state: `opacity: 0.5`, `cursor: not-allowed`.
- Loading state: Replace text with a 16px spinner (same color as text).
- Icon + text buttons: Icon at 16px, `8px` gap before text.
- Icon-only buttons: 36px × 36px square, icon centered at 18px.

### Form Inputs

```
Background: --color-surface
Border: 1px solid --color-border
Text: --color-text-primary, text-base weight 400
Placeholder: --color-text-tertiary
Padding: 10px 14px
Radius: --radius-md (8px)
Height: 40px (single-line inputs)
```

- Focus: `2px` ring in `--color-primary` with `2px` offset (use `ring-2 ring-offset-2` pattern). Border changes to `--color-primary`.
- Error: Border changes to `--color-error`. Error message in `text-xs` `--color-error` appears `4px` below input.
- Labels: `text-sm` weight 500, `--color-text-primary`, `6px` margin-bottom.
- Helper text: `text-xs` weight 400, `--color-text-secondary`, `4px` below input.
- Select dropdowns: Same styling as inputs, with a `chevron-down` icon (Lucide) at 16px on the right.
- Textareas: Same styling, minimum height `80px`, resize vertical only.
- Searchable dropdowns: Input with a results dropdown below, `--shadow-md`, max-height `240px` with scroll.

### Data Tables

Tables are the most important UI element in this app. Get them right.

```
Container: --color-surface bg, 1px solid --color-border, --shadow-sm, --radius-lg (12px)
Header row: --color-surface-hover bg (#F5F4F1)
Header cells: text-xs weight 600, uppercase, tracking-wider (letter-spacing: 0.05em), --color-text-secondary
Body cells: text-sm weight 400, --color-text-primary
Row border: 1px solid --color-border-subtle between rows
Row hover: --color-surface-hover bg
Cell padding: 12px vertical, 16px horizontal
```

- Number columns (rents, counts, variance): `text-right`, `tabular-nums`.
- Currency values: Format as `$X,XXX` — no decimals unless cents matter.
- Negative variance: `--color-error` text color.
- Positive variance: `--color-success` text color.
- Zero variance: `--color-text-tertiary` text color.
- Status column: Render as a badge (see below).
- Notes column: Truncate at 200px with ellipsis. Full text on hover tooltip or click.
- Empty table: Center-aligned message "No tours logged today" in `text-sm` `--color-text-secondary`, with a subtle illustration or icon above.
- Clickable rows: `cursor-pointer`, hover state as specified.

### Status Badges

Compact, not pill-shaped. Used for prospect status and pipeline stage.

```
Font: text-xs weight 600
Padding: 2px 8px
Radius: --radius-sm (4px)
Text-transform: capitalize
```

Prospect status badges:
- Hot: `--color-hot` text on `--color-hot-bg` background
- Warm: `--color-warm` text on `--color-warm-bg` background
- Cold: `--color-cold` text on `--color-cold-bg` background
- Applied: `--color-applied` text on `--color-applied-bg` background
- Not Interested: `--color-not-interested` text on `--color-not-interested-bg` background

Pipeline stage badges use the same pattern with stage colors.

### Cards (Dashboard)

```
Background: --color-surface
Radius: --radius-xl (16px)
Shadow: --shadow-md
Padding: 24px
```

**Metric cards** (top row of dashboard):
- Metric value: `text-3xl` weight 700, `--color-text-primary`, `tabular-nums`.
- Metric label: `text-sm` weight 500, `--color-text-secondary`, `4px` above the value.
- Optional delta: `text-xs` weight 600, green up-arrow or red down-arrow with percentage, `8px` below the value.

### Slide-Over Panel

Used for tour entry form, application detail, pipeline card detail.

```
Width: 480px (desktop), 100% (mobile)
Background: --color-surface
Shadow: --shadow-lg
Position: fixed right, full height
Overlay: rgba(0, 0, 0, 0.3) backdrop
Animation: slide in from right, 200ms ease-out
```

- Header: `24px` padding, title in `text-lg` weight 600, close button (X icon) top-right.
- Body: `24px` horizontal padding, `20px` vertical padding, scrollable if content overflows.
- Footer: `24px` padding, sticky bottom, `1px` top border, contains action buttons right-aligned.

### Kanban Board

```
Column background: --color-bg (#F8F7F4)
Column header: text-sm weight 600, --color-text-primary, with count badge
Column width: equal distribution, min 240px, horizontal scroll if needed
Column padding: 12px
Card gap: 8px
```

Kanban cards:
```
Background: --color-surface
Border: 1px solid --color-border
Radius: --radius-lg (12px)
Padding: 16px
Shadow: --shadow-sm
Drag shadow: --shadow-lg (when being dragged)
```

- Card content: Prospect name in `text-sm` weight 600, Unit info in `text-xs` `--color-text-secondary`, days-in-stage in `text-xs` `--color-text-tertiary`.
- Card hover: `--shadow-md`, border color `--color-border` (slightly more visible).
- Dragging: Slight rotation (2deg), `--shadow-lg`, `opacity: 0.9`.
- Drop target: Column gets a `2px` dashed border in `--color-primary-light`.

### Charts (Recharts)

```
Bar chart fill: --color-primary for current week, --color-border for prior week
Line chart stroke: --color-primary, 2px
Grid lines: --color-border-subtle, dashed
Axis labels: text-xs weight 400, --color-text-secondary
Tooltip: --color-surface bg, --shadow-md, --radius-md, 12px padding
```

- Funnel chart: Use stage colors with decreasing opacity.
- Keep charts simple. No 3D, no gradients, no animations beyond a subtle load-in.

### Day Tabs (Tour Log)

```
Container: flex row, 1px bottom border in --color-border
Tab: text-sm weight 500, --color-text-secondary, 12px horizontal padding, 10px vertical padding
Active tab: --color-primary text, 2px bottom border in --color-primary
Hover: --color-text-primary text
Today indicator: small 6px dot in --color-accent below the day abbreviation (only for today)
```

### Toasts / Notifications

```
Position: bottom-right, 24px from edges
Background: --color-surface
Border: 1px solid --color-border
Shadow: --shadow-lg
Radius: --radius-lg (12px)
Padding: 16px
Max-width: 380px
Animation: slide up + fade in, 200ms
Auto-dismiss: 4 seconds
```

- Success toast: `4px` left border in `--color-success`.
- Error toast: `4px` left border in `--color-error`.
- Text: `text-sm` weight 500, one line. Dismiss X on the right.

---

## Layout Patterns

### Page Structure

Every authenticated page follows this layout:

```
┌─────────────────────────────────────────────┐
│ Sidebar (240px) │ Content Area              │
│                 │                           │
│ Logo            │ Page Header               │
│ ─────           │ ─────────────────         │
│ Nav items       │                           │
│                 │ Page Content              │
│                 │ (max-width: 1280px)       │
│                 │ (padding: 24px)           │
│                 │                           │
│                 │                           │
│ User info       │                           │
└─────────────────────────────────────────────┘
```

### Page Header

Every page has a consistent header area:

```
Height: auto (content-driven)
Margin-bottom: 24px
```

- Page title: `text-xl` weight 700, `--color-text-primary`.
- Description (optional): `text-sm` weight 400, `--color-text-secondary`, `4px` below title.
- Actions (right-aligned): Primary buttons, filters, view toggles.
- Below header, before content: Tabs or filter bar if applicable (like day tabs on tour log, table/kanban toggle on pipeline).

### Responsive Breakpoints

```
Mobile:  < 640px   — single column, full-width cards, slide-over is full-screen
Tablet:  640–1024px — content fills width, sidebar hidden (hamburger menu)
Desktop: > 1024px  — sidebar + content side-by-side
```

- Dashboard metric cards: 3 columns on desktop, 2 on tablet, 1 stacked on mobile.
- Tour log table: Horizontal scroll on mobile with sticky first column (Name).
- Kanban board: Horizontal scroll on all sizes, columns don't stack.
- Tour form: Single column on mobile, two columns on desktop for related field pairs (Market Rent + Concession, Effective Rent + Budget).

### Shared Dashboard (Public)

No sidebar, no navigation. Different layout:

```
Background: --color-bg
Max-width: 1120px, centered
Padding: 48px (desktop), 24px (mobile)
```

- Header: Property name in `text-xl` weight 700, "Live Leasing Metrics" in `text-sm` weight 500 `--color-text-secondary`. Small gold accent line (2px, 40px wide, `--color-accent`) between them.
- Content: Same dashboard cards and charts, but with slightly more vertical spacing (32px gaps).
- Footer: "Powered by LeaseFlow" in `text-xs` `--color-text-tertiary`, centered, `48px` bottom margin.
- No interactive elements except a date range filter at the top.

---

## Iconography

Use **Lucide React** (`lucide-react`) exclusively. No other icon libraries.

```
Default size: 18px
Stroke width: 1.5
Color: inherits from parent text color
```

Key icon mappings:
- Tours/Daily Log: `Calendar` or `ClipboardList`
- Pipeline: `Kanban` or `Layers`
- Dashboard: `BarChart3`
- Units: `Building2`
- Settings: `Settings`
- New/Add: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`
- Close: `X`
- Search: `Search`
- Export: `Download`
- Share: `Share2`
- Chevrons: `ChevronLeft`, `ChevronRight`, `ChevronDown`
- Status: `Circle` (filled, colored) at 8px for inline status dots

---

## Animation & Transitions

Keep it minimal and functional. No decorative animations.

```
--transition-fast:    150ms ease
--transition-normal:  200ms ease-out
--transition-slow:    300ms ease-out
```

- Button hover/active: `--transition-fast` on background and shadow.
- Slide-over open/close: `--transition-slow` with `translateX`.
- Dropdown open: `--transition-normal` with `opacity` and slight `translateY(-4px)`.
- Page transitions: None. Instant. Don't animate route changes.
- Toast enter: `--transition-normal` with `translateY(8px)` and `opacity`.
- Loading spinner: 16px circle, `1.5px` stroke, `--color-primary`, CSS spin animation `0.6s linear infinite`.
- Skeleton loading: Pulse animation on `--color-surface-hover` blocks shaped like the content they replace.

---

## Implementation Notes for Claude Code

1. **Tailwind config**: Extend the default config with all custom colors, fonts, radii, and shadows defined above. Use semantic names (`primary`, `surface`, `border-subtle`, etc.) not raw hex values in components.

2. **CSS custom properties**: Define all colors as CSS variables in `index.css` so they can be referenced both in Tailwind config and in any one-off styles. This also makes future theming possible.

3. **Google Fonts**: Load Plus Jakarta Sans in `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
   ```

4. **Tabular numbers**: Add a utility class `.tabular-nums` with `font-variant-numeric: tabular-lining` and apply it to all number-displaying table columns.

5. **Consistent component sizing**: All interactive elements (buttons, inputs, selects, badges) should feel like they belong in the same system. Test them side-by-side.

6. **Mobile tour form priority**: The tour entry form on mobile is the single most important UX flow. Test it at `375px` width. Every field should be reachable with one hand. The "Save" button should be visible without scrolling past the last field.

7. **Shared dashboard is a separate visual context**: It has no sidebar, different spacing, and a cleaner header. Build it as a separate layout component, not a conditional render inside the main layout.
