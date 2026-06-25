import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()
const PROPERTY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM units WHERE property_id = $1 ORDER BY unit_number',
      [PROPERTY_ID]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { unit_number, unit_type, floor, market_rent, sqft, status } = req.body
    const { rows } = await pool.query(
      `INSERT INTO units (property_id, unit_number, unit_type, floor, market_rent, sqft, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [PROPERTY_ID, unit_number, unit_type, floor || null, market_rent || null, sqft || null, status || 'available']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { unit_number, unit_type, floor, market_rent, sqft, status } = req.body
    const { rows } = await pool.query(
      `UPDATE units SET unit_number=$1, unit_type=$2, floor=$3, market_rent=$4, sqft=$5, status=$6, updated_at=now()
       WHERE id=$7 AND property_id=$8 RETURNING *`,
      [unit_number, unit_type, floor || null, market_rent || null, sqft || null, status, req.params.id, PROPERTY_ID]
    )
    if (!rows.length) return res.status(404).json({ error: 'Unit not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM units WHERE id=$1 AND property_id=$2',
      [req.params.id, PROPERTY_ID]
    )
    if (!rowCount) return res.status(404).json({ error: 'Unit not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/rent-floors', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT unit_code, min_gross_rent FROM rent_floors WHERE property_id = $1 ORDER BY unit_code',
      [PROPERTY_ID]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/import', async (req, res) => {
  try {
    const units = req.body.units
    if (!Array.isArray(units) || !units.length) {
      return res.status(400).json({ error: 'No units provided' })
    }
    const inserted = []
    for (const u of units) {
      const { rows } = await pool.query(
        `INSERT INTO units (property_id, unit_number, unit_type, floor, market_rent, sqft, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [PROPERTY_ID, u.unit_number, u.unit_type, u.floor || null, u.market_rent || null, u.sqft || null, u.status || 'available']
      )
      inserted.push(rows[0])
    }
    res.status(201).json(inserted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
