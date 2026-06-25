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

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
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

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})
