import { Router } from 'express'
import crypto from 'crypto'
import { pool } from '../db/index.js'

const router = Router()
const PROPERTY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM share_links WHERE property_id = $1 ORDER BY created_at DESC',
      [PROPERTY_ID]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { label, expires_at } = req.body
    const token = crypto.randomBytes(24).toString('hex')
    const { rows } = await pool.query(
      `INSERT INTO share_links (property_id, token, label, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [PROPERTY_ID, token, label || 'Dashboard Link', expires_at || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM share_links WHERE id = $1 AND property_id = $2',
      [req.params.id, PROPERTY_ID]
    )
    if (!rowCount) return res.status(404).json({ error: 'Link not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:token/dashboard', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM share_links WHERE token = $1',
      [req.params.token]
    )
    if (!rows.length) return res.status(404).json({ error: 'Invalid link' })

    const link = rows[0]
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Link expired' })
    }

    const propertyId = link.property_id
    const today = new Date().toISOString().split('T')[0]
    const monday = getMonday(new Date()).toISOString().split('T')[0]
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const since = thirtyDaysAgo.toISOString().split('T')[0]

    const [property, todayData, pipeline, funnel, velocity, toursDetail, appsDetail] = await Promise.all([
      pool.query('SELECT name FROM properties WHERE id = $1', [propertyId]),
      pool.query(
        `SELECT
          (SELECT COUNT(*)::int FROM tours WHERE property_id = $1 AND tour_date = $2) as tours_today,
          (SELECT COUNT(*)::int FROM applications WHERE property_id = $1 AND created_at::date = $2) as new_applications,
          (SELECT COUNT(*)::int FROM applications WHERE property_id = $1 AND pipeline_stage = 'lease_executed' AND lease_execution_date >= $3) as leases_this_week`,
        [propertyId, today, monday]
      ),
      pool.query(
        `SELECT pipeline_stage, COUNT(*)::int as count,
                ROUND(AVG(EXTRACT(EPOCH FROM (now() - stage_entered_at)) / 86400))::int as avg_days
         FROM applications WHERE property_id = $1 GROUP BY pipeline_stage`,
        [propertyId]
      ),
      pool.query(
        `SELECT
          (SELECT COUNT(*)::int FROM tours WHERE property_id = $1 AND tour_date >= $2) as total_tours,
          (SELECT COUNT(*)::int FROM tours WHERE property_id = $1 AND tour_date >= $2 AND status = 'hot') as hot,
          (SELECT COUNT(*)::int FROM applications WHERE property_id = $1 AND created_at >= $2) as applied,
          (SELECT COUNT(*)::int FROM applications WHERE property_id = $1 AND created_at >= $2 AND pipeline_stage IN ('approved','lease_sent','lease_executed','move_in_scheduled')) as approved,
          (SELECT COUNT(*)::int FROM applications WHERE property_id = $1 AND created_at >= $2 AND pipeline_stage IN ('lease_executed','move_in_scheduled')) as executed`,
        [propertyId, since]
      ),
      pool.query(
        `SELECT ROUND(AVG(a.lease_execution_date - t.tour_date))::int as avg_days
         FROM applications a
         JOIN tours t ON t.prospect_id = a.prospect_id AND t.property_id = a.property_id
         WHERE a.property_id = $1 AND a.pipeline_stage IN ('lease_executed','move_in_scheduled')
           AND a.lease_execution_date IS NOT NULL AND a.lease_execution_date >= CURRENT_DATE - interval '30 days'`,
        [propertyId]
      ),
      pool.query(
        `SELECT t.*, p.name as prospect_name, p.source
         FROM tours t JOIN prospects p ON t.prospect_id = p.id
         WHERE t.property_id = $1 AND t.tour_date = $2
         ORDER BY t.created_at DESC`,
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
    ])

    const f = funnel.rows[0]
    res.json({
      property_name: property.rows[0]?.name || 'Property',
      today: todayData.rows[0],
      pipeline: pipeline.rows,
      funnel: {
        steps: [
          { label: 'Tours', count: f.total_tours },
          { label: 'Hot Leads', count: f.hot },
          { label: 'Applied', count: f.applied },
          { label: 'Approved', count: f.approved },
          { label: 'Leased', count: f.executed },
        ],
      },
      velocity: { avg_days: velocity.rows[0].avg_days || 0 },
      toursDetail: toursDetail.rows,
      appsDetail: appsDetail.rows,
    })
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
