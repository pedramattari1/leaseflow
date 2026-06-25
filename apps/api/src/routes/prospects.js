import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()
const PROPERTY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    if (!search) return res.json([])
    const { rows } = await pool.query(
      `SELECT id, name, email, phone FROM prospects
       WHERE property_id = $1 AND name ILIKE $2
       ORDER BY name LIMIT 10`,
      [PROPERTY_ID, `%${search}%`]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { rows: [prospect] } = await pool.query(
      'SELECT * FROM prospects WHERE id = $1 AND property_id = $2',
      [req.params.id, PROPERTY_ID]
    )
    if (!prospect) return res.status(404).json({ error: 'Prospect not found' })

    const { rows: tours } = await pool.query(
      'SELECT * FROM tours WHERE prospect_id = $1 ORDER BY tour_date DESC',
      [req.params.id]
    )
    prospect.tours = tours
    res.json(prospect)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
