import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()
const PROPERTY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, p.name as prospect_name, p.email as prospect_email, p.phone as prospect_phone,
              EXTRACT(DAY FROM now() - a.stage_entered_at)::int as days_in_stage
       FROM applications a
       JOIN prospects p ON a.prospect_id = p.id
       WHERE a.property_id = $1
       ORDER BY a.stage_entered_at DESC`,
      [PROPERTY_ID]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/export', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.name, p.email, p.phone, a.unit_number, a.unit_type, a.market_rent,
              a.pipeline_stage, a.app_submitted_date, a.approval_date,
              a.lease_execution_date, a.lease_execution_target, a.move_in_date,
              EXTRACT(DAY FROM now() - a.stage_entered_at)::int as days_in_stage, a.notes
       FROM applications a JOIN prospects p ON a.prospect_id = p.id
       WHERE a.property_id = $1 ORDER BY a.created_at DESC`,
      [PROPERTY_ID]
    )
    const headers = ['Name','Email','Phone','Unit','Type','Market Rent','Stage','App Submitted','Approval','Lease Executed','Lease Target','Move-in','Days in Stage','Notes']
    const csvRows = rows.map(r => [
      r.name, r.email, r.phone, r.unit_number, r.unit_type, r.market_rent,
      r.pipeline_stage, r.app_submitted_date?.toISOString().split('T')[0],
      r.approval_date?.toISOString().split('T')[0], r.lease_execution_date?.toISOString().split('T')[0],
      r.lease_execution_target?.toISOString().split('T')[0], r.move_in_date?.toISOString().split('T')[0],
      r.days_in_stage, `"${(r.notes||'').replace(/"/g,'""')}"`
    ].join(','))
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=pipeline.csv')
    res.send([headers.join(','), ...csvRows].join('\n'))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const {
      prospect_id, unit_id, unit_type, unit_number, market_rent,
      app_submitted_date, notes
    } = req.body

    const { rows } = await pool.query(
      `INSERT INTO applications (prospect_id, property_id, unit_id, unit_type, unit_number,
        market_rent, pipeline_stage, app_submitted_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,'applied',$7,$8) RETURNING *`,
      [prospect_id, PROPERTY_ID, unit_id || null, unit_type || null, unit_number || null,
       market_rent || null, app_submitted_date || new Date().toISOString().split('T')[0], notes || null]
    )

    await pool.query(
      `INSERT INTO pipeline_history (application_id, from_stage, to_stage)
       VALUES ($1, NULL, 'applied')`,
      [rows[0].id]
    )

    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const {
      unit_id, unit_type, unit_number, market_rent,
      app_submitted_date, approval_date, lease_execution_date,
      lease_execution_target, move_in_date, notes
    } = req.body

    const { rows } = await pool.query(
      `UPDATE applications SET unit_id=$1, unit_type=$2, unit_number=$3, market_rent=$4,
        app_submitted_date=$5, approval_date=$6, lease_execution_date=$7,
        lease_execution_target=$8, move_in_date=$9, notes=$10, updated_at=now()
       WHERE id=$11 AND property_id=$12 RETURNING *`,
      [unit_id || null, unit_type, unit_number, market_rent || null,
       app_submitted_date || null, approval_date || null, lease_execution_date || null,
       lease_execution_target || null, move_in_date || null, notes || null,
       req.params.id, PROPERTY_ID]
    )
    if (!rows.length) return res.status(404).json({ error: 'Application not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id/stage', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { stage, notes } = req.body

    const { rows: [current] } = await client.query(
      'SELECT pipeline_stage FROM applications WHERE id=$1 AND property_id=$2',
      [req.params.id, PROPERTY_ID]
    )
    if (!current) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Application not found' })
    }

    const { rows } = await client.query(
      `UPDATE applications SET pipeline_stage=$1, stage_entered_at=now(), updated_at=now()
       WHERE id=$2 RETURNING *`,
      [stage, req.params.id]
    )

    await client.query(
      `INSERT INTO pipeline_history (application_id, from_stage, to_stage, notes)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, current.pipeline_stage, stage, notes || null]
    )

    await client.query('COMMIT')
    res.json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

router.get('/:id/history', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM pipeline_history WHERE application_id = $1 ORDER BY changed_at ASC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
