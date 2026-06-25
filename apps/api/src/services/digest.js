import { pool } from '../db/index.js'

const STAGE_LABELS = {
  applied: 'Applied', screening: 'Screening', approved: 'Approved',
  lease_sent: 'Lease Sent', lease_executed: 'Executed', move_in_scheduled: 'Move-in',
}

export async function buildDigest(propertyId) {
  const today = new Date().toISOString().split('T')[0]
  const monday = getMonday(new Date()).toISOString().split('T')[0]
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const appUrl = process.env.APP_URL || 'https://wimmops.com'

  const [property, tours, apps, activeApps, movement, velocity, leases] = await Promise.all([
    pool.query('SELECT name FROM properties WHERE id = $1', [propertyId]),
    pool.query(
      `SELECT t.*, p.name as prospect_name, p.source
       FROM tours t JOIN prospects p ON t.prospect_id = p.id
       WHERE t.property_id = $1 AND t.tour_date = $2
       ORDER BY t.created_at`,
      [propertyId, today]
    ),
    pool.query(
      'SELECT COUNT(*)::int as count FROM applications WHERE property_id = $1 AND created_at::date = $2',
      [propertyId, today]
    ),
    pool.query(
      `SELECT a.*, p.name as prospect_name,
              EXTRACT(DAY FROM now() - a.stage_entered_at)::int as days_in_stage
       FROM applications a JOIN prospects p ON a.prospect_id = p.id
       WHERE a.property_id = $1
         AND a.pipeline_stage NOT IN ('lease_executed', 'move_in_scheduled')
       ORDER BY a.stage_entered_at ASC`,
      [propertyId]
    ),
    pool.query(
      `SELECT ph.*, p.name as prospect_name
       FROM pipeline_history ph
       JOIN applications a ON ph.application_id = a.id
       JOIN prospects p ON a.prospect_id = p.id
       WHERE a.property_id = $1 AND ph.changed_at::date = $2
       ORDER BY ph.changed_at`,
      [propertyId, today]
    ),
    pool.query(
      `SELECT ROUND(AVG(a.lease_execution_date - t.tour_date))::int as avg_days
       FROM applications a
       JOIN tours t ON t.prospect_id = a.prospect_id AND t.property_id = a.property_id
       WHERE a.property_id = $1
         AND a.pipeline_stage IN ('lease_executed', 'move_in_scheduled')
         AND a.lease_execution_date IS NOT NULL
         AND a.lease_execution_date >= CURRENT_DATE - interval '30 days'`,
      [propertyId]
    ),
    pool.query(
      `SELECT COUNT(*)::int as count FROM applications
       WHERE property_id = $1 AND pipeline_stage = 'lease_executed' AND lease_execution_date >= $2`,
      [propertyId, monday]
    ),
  ])

  const propertyName = property.rows[0]?.name || 'Property'
  const tourRows = tours.rows
  const newApps = apps.rows[0].count
  const leasesThisWeek = leases.rows[0].count
  const avgDays = velocity.rows[0].avg_days || 0

  const tourTableRows = tourRows.length
    ? tourRows.map(t => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;font-weight:500">${esc(t.prospect_name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${esc(t.unit_type || '—')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${t.unit_number || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;text-align:right">${t.market_rent ? '$' + Number(t.market_rent).toLocaleString() : '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;text-align:right">${t.budget ? '$' + Number(t.budget).toLocaleString() : '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${t.estimated_move_in ? new Date(t.estimated_move_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${esc(t.source || '—')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${statusBadge(t.status)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;color:#6B6B6B;max-width:200px">${esc(t.notes || '—')}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="9" style="padding:16px;text-align:center;color:#9CA3AF">No tours recorded today</td></tr>`

  const appTableRows = activeApps.rows.length
    ? activeApps.rows.map(a => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;font-weight:500">${esc(a.prospect_name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${esc(a.unit_type || '—')}${a.unit_number ? ' #' + esc(a.unit_number) : ''}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${STAGE_LABELS[a.pipeline_stage] || a.pipeline_stage}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;text-align:center">${a.days_in_stage || 0}d</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E1">${a.lease_execution_target ? new Date(a.lease_execution_target).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="5" style="padding:16px;text-align:center;color:#9CA3AF">No active applications</td></tr>`

  const movementRows = movement.rows.length
    ? movement.rows.map(m =>
        `<li style="padding:4px 0;color:#374151">${esc(m.prospect_name)}: ${STAGE_LABELS[m.from_stage] || m.from_stage || 'New'} → ${STAGE_LABELS[m.to_stage] || m.to_stage}</li>`
      ).join('')
    : `<li style="padding:4px 0;color:#9CA3AF">No pipeline changes today</li>`

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F5F3EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EF;padding:32px 16px">
<tr><td align="center">
<table width="100%" style="max-width:680px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

<!-- Header -->
<tr><td style="background:#1E3A5F;padding:24px 32px;text-align:center">
  <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600">${esc(propertyName)}</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Daily Leasing Report — ${dateLabel}</p>
</td></tr>

<!-- Summary Cards -->
<tr><td style="padding:24px 32px 16px">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:33%;text-align:center;padding:16px;background:#F9F8F6;border-radius:8px">
        <div style="font-size:28px;font-weight:700;color:#1E3A5F">${tourRows.length}</div>
        <div style="font-size:12px;color:#6B6B6B;margin-top:4px">Tours</div>
      </td>
      <td style="width:8px"></td>
      <td style="width:33%;text-align:center;padding:16px;background:#F9F8F6;border-radius:8px">
        <div style="font-size:28px;font-weight:700;color:#1E3A5F">${newApps}</div>
        <div style="font-size:12px;color:#6B6B6B;margin-top:4px">New Applications</div>
      </td>
      <td style="width:8px"></td>
      <td style="width:33%;text-align:center;padding:16px;background:#F9F8F6;border-radius:8px">
        <div style="font-size:28px;font-weight:700;color:#1E3A5F">${leasesThisWeek}</div>
        <div style="font-size:12px;color:#6B6B6B;margin-top:4px">Leases This Week</div>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Tour Detail -->
<tr><td style="padding:8px 32px 24px">
  <h2 style="font-size:14px;font-weight:600;color:#374151;margin:16px 0 12px;border-bottom:1px solid #E8E6E1;padding-bottom:8px">Tour Detail</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#374151">
    <tr style="background:#F9F8F6">
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Name</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Type</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Unit</th>
      <th style="padding:8px 12px;text-align:right;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Rent</th>
      <th style="padding:8px 12px;text-align:right;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Budget</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Move-in</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Source</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Status</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Notes</th>
    </tr>
    ${tourTableRows}
  </table>
</td></tr>

<!-- Active Applications -->
<tr><td style="padding:0 32px 24px">
  <h2 style="font-size:14px;font-weight:600;color:#374151;margin:0 0 12px;border-bottom:1px solid #E8E6E1;padding-bottom:8px">Active Applications</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#374151">
    <tr style="background:#F9F8F6">
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Applicant</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Unit</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Stage</th>
      <th style="padding:8px 12px;text-align:center;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Days</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;color:#6B6B6B;text-transform:uppercase">Target Date</th>
    </tr>
    ${appTableRows}
  </table>
</td></tr>

<!-- Pipeline Movement -->
<tr><td style="padding:0 32px 24px">
  <h2 style="font-size:14px;font-weight:600;color:#374151;margin:0 0 12px;border-bottom:1px solid #E8E6E1;padding-bottom:8px">Pipeline Movement</h2>
  <ul style="margin:0;padding:0 0 0 20px;font-size:13px;line-height:1.6">${movementRows}</ul>
</td></tr>

<!-- Velocity -->
<tr><td style="padding:0 32px 24px">
  <h2 style="font-size:14px;font-weight:600;color:#374151;margin:0 0 8px;border-bottom:1px solid #E8E6E1;padding-bottom:8px">Leasing Velocity</h2>
  <p style="margin:0;font-size:13px;color:#374151"><strong>${avgDays} days</strong> average tour-to-lease (30d trailing)</p>
</td></tr>

<!-- CTA -->
<tr><td style="padding:0 32px 32px;text-align:center">
  <a href="${appUrl}/dashboard?date=${today}" style="display:inline-block;padding:12px 28px;background:#1E3A5F;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">View Full Dashboard</a>
</td></tr>

<!-- Footer -->
<tr><td style="padding:16px 32px;text-align:center;border-top:1px solid #E8E6E1">
  <p style="margin:0;font-size:11px;color:#9CA3AF">Powered by LeaseFlow</p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`.trim()
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function statusBadge(status) {
  const colors = {
    hot: 'background:#FEE2E2;color:#B91C1C',
    warm: 'background:#FEF3C7;color:#92400E',
    cold: 'background:#DBEAFE;color:#1D4ED8',
    applied: 'background:#D1FAE5;color:#065F46',
    not_interested: 'background:#F3F4F6;color:#6B7280',
  }
  const label = status === 'not_interested' ? 'Not Interested' : (status?.charAt(0).toUpperCase() + status?.slice(1))
  return `<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:500;${colors[status] || ''}">${label}</span>`
}

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}
