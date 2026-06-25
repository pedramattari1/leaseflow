import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()
const PROPERTY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

router.get('/', async (req, res) => {
  try {
    const { date, week } = req.query
    let query, params

    if (week) {
      query = `
        SELECT t.*, p.name as prospect_name, p.email as prospect_email, p.phone as prospect_phone,
               p.profession, p.num_vehicles, p.source
        FROM tours t
        JOIN prospects p ON t.prospect_id = p.id
        WHERE t.property_id = $1
          AND t.tour_date >= $2::date
          AND t.tour_date < ($2::date + interval '7 days')
        ORDER BY t.tour_date, t.created_at`
      params = [PROPERTY_ID, week]
    } else {
      query = `
        SELECT t.*, p.name as prospect_name, p.email as prospect_email, p.phone as prospect_phone,
               p.profession, p.num_vehicles, p.source
        FROM tours t
        JOIN prospects p ON t.prospect_id = p.id
        WHERE t.property_id = $1 AND t.tour_date = $2
        ORDER BY t.created_at`
      params = [PROPERTY_ID, date || new Date().toISOString().split('T')[0]]
    }

    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/summary', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0]
    const { rows } = await pool.query(
      `SELECT status, COUNT(*)::int as count
       FROM tours WHERE property_id = $1 AND tour_date = $2
       GROUP BY status`,
      [PROPERTY_ID, date]
    )
    const summary = { hot: 0, warm: 0, cold: 0, applied: 0, not_interested: 0, total: 0 }
    for (const r of rows) {
      summary[r.status] = r.count
      summary.total += r.count
    }
    res.json(summary)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/export', async (req, res) => {
  try {
    const { week } = req.query
    const weekStart = week || new Date().toISOString().split('T')[0]
    const { rows } = await pool.query(
      `SELECT t.tour_date, p.name, p.email, p.phone, t.unit_number, t.unit_type,
              t.market_rent, t.concession, t.effective_rent, t.budget, t.variance,
              t.comps_toured, t.desired_term, t.estimated_move_in, t.status, t.notes,
              p.profession, p.num_vehicles, p.source
       FROM tours t JOIN prospects p ON t.prospect_id = p.id
       WHERE t.property_id = $1 AND t.tour_date >= $2::date AND t.tour_date < $2::date + interval '7 days'
       ORDER BY t.tour_date, t.created_at`,
      [PROPERTY_ID, weekStart]
    )
    const headers = ['Date','Name','Email','Phone','Unit','Type','Market Rent','Concession','Eff. Rent','Budget','Variance','Comps','Term','Est. Move-in','Status','Notes','Profession','Vehicles','Source']
    const csvRows = rows.map(r => [
      r.tour_date?.toISOString().split('T')[0], r.name, r.email, r.phone, r.unit_number, r.unit_type,
      r.market_rent, r.concession, r.effective_rent, r.budget, r.variance,
      r.comps_toured, r.desired_term, r.estimated_move_in?.toISOString().split('T')[0],
      r.status, `"${(r.notes||'').replace(/"/g,'""')}"`, r.profession, r.num_vehicles, r.source
    ].join(','))
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=tours-${weekStart}.csv`)
    res.send([headers.join(','), ...csvRows].join('\n'))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const {
      prospect_name, prospect_email, prospect_phone, prospect_id: existingProspectId,
      profession, num_vehicles, source,
      tour_date, unit_id, unit_type, unit_number, market_rent,
      concession, concession_weeks, effective_rent, budget, variance,
      comps_toured, desired_term, estimated_move_in, status, notes
    } = req.body

    let prospect_id = existingProspectId
    if (!prospect_id) {
      const { rows } = await client.query(
        `INSERT INTO prospects (property_id, name, email, phone, profession, num_vehicles, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [PROPERTY_ID, prospect_name, prospect_email || null, prospect_phone || null,
         profession || null, num_vehicles || 0, source || null]
      )
      prospect_id = rows[0].id
    }

    const { rows } = await client.query(
      `INSERT INTO tours (prospect_id, property_id, tour_date, unit_id, unit_type, unit_number,
        market_rent, concession, concession_weeks, effective_rent, budget, variance, comps_toured,
        desired_term, estimated_move_in, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [prospect_id, PROPERTY_ID, tour_date || new Date().toISOString().split('T')[0],
       unit_id || null, unit_type || null, unit_number || null,
       market_rent || null, concession || 0, concession_weeks || 0, effective_rent || null,
       budget || null, variance || null, comps_toured || 0,
       desired_term || null, estimated_move_in || null, status || 'warm', notes || null]
    )

    await client.query('COMMIT')
    const tour = rows[0]
    tour.prospect_name = prospect_name
    tour.profession = profession
    tour.num_vehicles = num_vehicles
    tour.source = source
    res.status(201).json(tour)
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

router.put('/:id', async (req, res) => {
  try {
    const {
      unit_id, unit_type, unit_number, market_rent, concession, concession_weeks, effective_rent,
      budget, variance, comps_toured, desired_term, estimated_move_in, status, notes
    } = req.body

    const { rows } = await pool.query(
      `UPDATE tours SET unit_id=$1, unit_type=$2, unit_number=$3, market_rent=$4,
        concession=$5, concession_weeks=$6, effective_rent=$7, budget=$8, variance=$9, comps_toured=$10,
        desired_term=$11, estimated_move_in=$12, status=$13, notes=$14, updated_at=now()
       WHERE id=$15 AND property_id=$16 RETURNING *`,
      [unit_id || null, unit_type, unit_number, market_rent || null,
       concession || 0, concession_weeks || 0, effective_rent || null, budget || null, variance || null,
       comps_toured || 0, desired_term || null, estimated_move_in || null,
       status, notes || null, req.params.id, PROPERTY_ID]
    )
    if (!rows.length) return res.status(404).json({ error: 'Tour not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM tours WHERE id=$1 AND property_id=$2',
      [req.params.id, PROPERTY_ID]
    )
    if (!rowCount) return res.status(404).json({ error: 'Tour not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
