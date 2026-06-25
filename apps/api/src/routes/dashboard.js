import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()
const PROPERTY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const weekStart = getMonday(new Date()).toISOString().split('T')[0]

    const [tours, apps, leases] = await Promise.all([
      pool.query(
        'SELECT COUNT(*)::int as count FROM tours WHERE property_id = $1 AND tour_date = $2',
        [PROPERTY_ID, today]
      ),
      pool.query(
        'SELECT COUNT(*)::int as count FROM applications WHERE property_id = $1 AND created_at::date = $2',
        [PROPERTY_ID, today]
      ),
      pool.query(
        `SELECT COUNT(*)::int as count FROM applications
         WHERE property_id = $1 AND pipeline_stage = 'lease_executed'
           AND lease_execution_date >= $2`,
        [PROPERTY_ID, weekStart]
      ),
    ])

    res.json({
      tours_today: tours.rows[0].count,
      new_applications: apps.rows[0].count,
      leases_this_week: leases.rows[0].count,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/weekly', async (req, res) => {
  try {
    const weekDate = req.query.week ? new Date(req.query.week) : new Date()
    const currentMonday = getMonday(weekDate)
    const priorMonday = new Date(currentMonday)
    priorMonday.setDate(priorMonday.getDate() - 7)

    const [current, prior] = await Promise.all([
      pool.query(
        `SELECT tour_date, COUNT(*)::int as count
         FROM tours WHERE property_id = $1
           AND tour_date >= $2::date AND tour_date < $2::date + interval '7 days'
         GROUP BY tour_date ORDER BY tour_date`,
        [PROPERTY_ID, currentMonday.toISOString().split('T')[0]]
      ),
      pool.query(
        `SELECT tour_date, COUNT(*)::int as count
         FROM tours WHERE property_id = $1
           AND tour_date >= $2::date AND tour_date < $2::date + interval '7 days'
         GROUP BY tour_date ORDER BY tour_date`,
        [PROPERTY_ID, priorMonday.toISOString().split('T')[0]]
      ),
    ])

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const data = days.map((day, i) => {
      const currentDate = new Date(currentMonday)
      currentDate.setDate(currentDate.getDate() + i)
      const priorDate = new Date(priorMonday)
      priorDate.setDate(priorDate.getDate() + i)
      const cStr = currentDate.toISOString().split('T')[0]
      const pStr = priorDate.toISOString().split('T')[0]

      return {
        day,
        current: current.rows.find((r) => r.tour_date.toISOString().split('T')[0] === cStr)?.count || 0,
        prior: prior.rows.find((r) => r.tour_date.toISOString().split('T')[0] === pStr)?.count || 0,
      }
    })

    res.json({ data, weekOf: currentMonday.toISOString().split('T')[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/pipeline', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pipeline_stage,
              COUNT(*)::int as count,
              ROUND(AVG(EXTRACT(EPOCH FROM (now() - stage_entered_at)) / 86400))::int as avg_days
       FROM applications WHERE property_id = $1
       GROUP BY pipeline_stage`,
      [PROPERTY_ID]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/funnel', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const since = thirtyDaysAgo.toISOString().split('T')[0]

    const [toursResult, statusResult, stageResult] = await Promise.all([
      pool.query(
        'SELECT COUNT(*)::int as count FROM tours WHERE property_id = $1 AND tour_date >= $2',
        [PROPERTY_ID, since]
      ),
      pool.query(
        `SELECT status, COUNT(*)::int as count FROM tours
         WHERE property_id = $1 AND tour_date >= $2
         GROUP BY status`,
        [PROPERTY_ID, since]
      ),
      pool.query(
        `SELECT pipeline_stage, COUNT(*)::int as count FROM applications
         WHERE property_id = $1 AND created_at >= $2
         GROUP BY pipeline_stage`,
        [PROPERTY_ID, since]
      ),
    ])

    const totalTours = toursResult.rows[0].count
    const hot = statusResult.rows.find((r) => r.status === 'hot')?.count || 0
    const applied = stageResult.rows.reduce((s, r) => s + r.count, 0)
    const approved = stageResult.rows
      .filter((r) => ['approved', 'lease_sent', 'lease_executed', 'move_in_scheduled'].includes(r.pipeline_stage))
      .reduce((s, r) => s + r.count, 0)
    const executed = stageResult.rows
      .filter((r) => ['lease_executed', 'move_in_scheduled'].includes(r.pipeline_stage))
      .reduce((s, r) => s + r.count, 0)

    res.json({
      steps: [
        { label: 'Tours', count: totalTours },
        { label: 'Hot Leads', count: hot },
        { label: 'Applied', count: applied },
        { label: 'Approved', count: approved },
        { label: 'Leased', count: executed },
      ],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/velocity', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ROUND(AVG(a.lease_execution_date - t.tour_date))::int as avg_days
       FROM applications a
       JOIN tours t ON t.prospect_id = a.prospect_id AND t.property_id = a.property_id
       WHERE a.property_id = $1
         AND a.pipeline_stage IN ('lease_executed', 'move_in_scheduled')
         AND a.lease_execution_date IS NOT NULL
         AND a.lease_execution_date >= CURRENT_DATE - interval '30 days'`,
      [PROPERTY_ID]
    )
    res.json({ avg_days: rows[0].avg_days || 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export default router
