import { pool } from '../db/index.js'

export async function buildDigest(propertyId) {
  const today = new Date().toISOString().split('T')[0]

  const [tours, statuses, apps, stalls] = await Promise.all([
    pool.query('SELECT COUNT(*)::int as count FROM tours WHERE property_id = $1 AND tour_date = $2', [propertyId, today]),
    pool.query('SELECT status, COUNT(*)::int as count FROM tours WHERE property_id = $1 AND tour_date = $2 GROUP BY status', [propertyId, today]),
    pool.query('SELECT COUNT(*)::int as count FROM applications WHERE property_id = $1 AND created_at::date = $2', [propertyId, today]),
    pool.query(
      `SELECT a.id, p.name as prospect_name, a.unit_number, a.pipeline_stage,
              EXTRACT(DAY FROM now() - a.stage_entered_at)::int as days_in_stage
       FROM applications a JOIN prospects p ON a.prospect_id = p.id
       WHERE a.property_id = $1
         AND EXTRACT(DAY FROM now() - a.stage_entered_at) >= (
           SELECT COALESCE(pipeline_stall_days, 5) FROM notification_settings WHERE property_id = $1
         )
         AND a.pipeline_stage NOT IN ('lease_executed', 'move_in_scheduled')
       ORDER BY days_in_stage DESC`,
      [propertyId]
    ),
  ])

  const statusMap = {}
  statuses.rows.forEach((r) => { statusMap[r.status] = r.count })

  const stallRows = stalls.rows.map((s) =>
    `<tr><td>${s.prospect_name}</td><td>${s.unit_number || '—'}</td><td>${s.pipeline_stage}</td><td>${s.days_in_stage}d</td></tr>`
  ).join('')

  return `
    <h2>Daily Digest — ${new Date().toLocaleDateString()}</h2>
    <h3>Tours Today: ${tours.rows[0].count}</h3>
    <ul>
      ${Object.entries(statusMap).map(([k, v]) => `<li>${k}: ${v}</li>`).join('')}
    </ul>
    <h3>New Applications: ${apps.rows[0].count}</h3>
    ${stalls.rows.length ? `
      <h3>⚠️ Pipeline Stalls (${stalls.rows.length})</h3>
      <table border="1" cellpadding="4"><tr><th>Prospect</th><th>Unit</th><th>Stage</th><th>Days</th></tr>${stallRows}</table>
    ` : '<p>No pipeline stalls.</p>'}
  `.trim()
}
