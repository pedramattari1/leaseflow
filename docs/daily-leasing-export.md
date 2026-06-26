# Daily Leasing Export (emailed .xlsx)

Emails the daily leasing export as a real Excel (`.xlsx`) attachment to the
asset-control / reporting team each morning.

## What it sends
- The same tour data and columns as the manual **Export** button on the Tours
  page (now also `.xlsx`): Date, Name, Email, Phone, Unit, Type, Market Rent,
  Concession, Eff. Rent, Budget, Variance, Comps, Term, Est. Move-in, Status,
  Notes, Profession, Vehicles, Source.
- Default window: **yesterday** (the day that just completed). Override with a
  JSON body `{ "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }`.

## Endpoint
```
POST /api/notifications/daily-export
```
- Returns `{ sent: false, reason }` if the feature is disabled or no export
  recipients are configured.
- Returns `{ sent, recipients, range, filename }` on success.

### Auth (CRON_SECRET)
If the `CRON_SECRET` env var is set, the request must include it via the
`x-cron-secret` header or `?secret=` query param; otherwise it returns 401.
If `CRON_SECRET` is unset, the endpoint is open (fine for local/manual use, but
**set it in production**).

## Configuration (Settings → Notifications → Daily Leasing Export)
- **Toggle:** enables/disables the morning send.
- **Export recipients:** comma-separated list (separate from the digest/weekly
  recipients).

These persist on `notification_settings` as `daily_export_enabled` and
`export_recipient_emails`. The columns are added automatically on API startup
(idempotent `ADD COLUMN IF NOT EXISTS`).

## Required production setup (external)
1. **Resend domain verification** — the default sender is
   `LeaseFlow <notifications@leaseflow.app>`. That domain is **not verified** in
   the current Resend account, so sends fail with a domain error. Verify a
   domain in https://resend.com/domains and set `RESEND_FROM` to a matching
   address (e.g. `LeaseFlow <reports@wimmops.com>`).
2. **`RESEND_API_KEY`** — confirm it is set in Railway (without it, emails are
   stubbed to the server log, not sent).
3. **`CRON_SECRET`** — set a strong value in Railway and pass it from the
   scheduler.
4. **Scheduler** — nothing calls this on a schedule yet. Wire one of:
   - **Railway cron** (a scheduled service that curls the endpoint), or
   - **GitHub Actions** scheduled workflow, or
   - **cron-job.org** / similar.

   Example morning call (8:00 AM):
   ```
   curl -X POST https://<api-host>/api/notifications/daily-export \
     -H "x-cron-secret: $CRON_SECRET"
   ```
