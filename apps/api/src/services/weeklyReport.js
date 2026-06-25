import { pool } from '../db/index.js'

export async function buildWeeklyReport(propertyId) {
  const now = new Date()
  const monday = getMonday(now)
  const priorMonday = new Date(monday)
  priorMonday.setDate(priorMonday.getDate() - 7)

  const mStr = monday.toISOString().split('T')[0]
  const pStr = priorMonday.toISOString().split('T')[0]

  const [thisWeek, lastWeek, stages, leases, velocity] = await Promise.all([
    pool.query('SELECT COUNT(*)::int as count FROM tours WHERE property_id = $1 AND tour_date >= $2 AND tour_date < $2::date + interval \'7 days\'', [propertyId, mStr]),
    pool.query('SELECT COUNT(*)::int as count FROM tours WHERE property_id = $1 AND tour_date >= $2 AND tour_date < $2::date + interval \'7 days\'', [propertyId, pStr]),
    pool.query('SELECT pipeline_stage, COUNT(*)::int as count FROM applications WHERE property_id = $1 GROUP BY pipeline_stage', [propertyId]),
    pool.query(`SELECT COUNT(*)::int as count FROM applications WHERE property_id = $1 AND pipeline_stage = 'lease_executed' AND lease_execution_date >= $2`, [propertyId, mStr]),
    pool.query(
      `SELECT ROUND(AVG(a.lease_execution_date - t.tour_date))::int as avg_days
       FROM applications a JOIN tours t ON t.prospect_id = a.prospect_id AND t.property_id = a.property_id
       WHERE a.property_id = $1 AND a.pipeline_stage IN ('lease_executed','move_in_scheduled')
         AND a.lease_execution_date IS NOT NULL AND a.lease_execution_date >= CURRENT_DATE - interval '30 days'`,
      [propertyId]
    ),
  ])

  const stageRows = stages.rows.map((s) => `<li>${s.pipeline_stage}: ${s.count}</li>`).join('')
  const tw = thisWeek.rows[0].count
  const lw = lastWeek.rows[0].count
  const delta = tw - lw
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→'

  return `
    <h2>Weekly Report — Week of ${monday.toLocaleDateString()}</h2>
    <h3>Tours: ${tw} ${arrow} (${lw} last week)</h3>
    <h3>Pipeline Breakdown</h3>
    <ul>${stageRows}</ul>
    <h3>Leases Executed This Week: ${leases.rows[0].count}</h3>
    <h3>Avg Leasing Velocity: ${velocity.rows[0].avg_days || 0} days</h3>
  `.trim()
}

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}
