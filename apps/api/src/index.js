import express from 'express'
import cors from 'cors'
import { pool } from './db/index.js'
import unitsRouter from './routes/units.js'
import toursRouter from './routes/tours.js'
import prospectsRouter from './routes/prospects.js'
import applicationsRouter from './routes/applications.js'
import dashboardRouter from './routes/dashboard.js'
import shareRouter from './routes/share.js'
import notificationsRouter from './routes/notifications.js'

const app = express()
const PORT = process.env.PORT || 3001

// Accept a comma-separated list of allowed origins via CORS_ORIGIN,
// e.g. "https://wimmops.com,https://www.wimmops.com". Falls back to local dev.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser clients (curl, server-to-server, health checks) with no Origin.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
}))
app.use(express.json())

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ status: 'ok', time: result.rows[0].now })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

app.use('/api/units', unitsRouter)
app.use('/api/tours', toursRouter)
app.use('/api/prospects', prospectsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/share', shareRouter)
app.use('/api/notifications', notificationsRouter)

async function ensureSchema() {
  // Idempotent column additions so production picks these up on deploy
  // without a separate migration step.
  await pool.query(`
    ALTER TABLE notification_settings
      ADD COLUMN IF NOT EXISTS daily_export_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS export_recipient_emails TEXT[]
  `)
}

ensureSchema()
  .catch((err) => console.error('ensureSchema failed:', err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`)
    })
  })
