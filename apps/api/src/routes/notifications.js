import { Router } from 'express'
import { pool } from '../db/index.js'
import { buildDigest } from '../services/digest.js'
import { buildWeeklyReport } from '../services/weeklyReport.js'
import { buildToursWorkbook } from '../services/export.js'
import { sendEmail } from '../services/email.js'
import { requireCronSecret } from '../middleware/cron.js'

const router = Router()
const PROPERTY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

router.get('/settings', async (req, res) => {
  try {
    let { rows } = await pool.query(
      'SELECT * FROM notification_settings WHERE property_id = $1',
      [PROPERTY_ID]
    )
    if (!rows.length) {
      const insert = await pool.query(
        'INSERT INTO notification_settings (property_id) VALUES ($1) RETURNING *',
        [PROPERTY_ID]
      )
      rows = insert.rows
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/settings', async (req, res) => {
  try {
    const { daily_digest_enabled, daily_digest_time, weekly_report_enabled, weekly_report_day, pipeline_stall_days, recipient_emails, daily_export_enabled, export_recipient_emails } = req.body
    const { rows } = await pool.query(
      `INSERT INTO notification_settings (property_id, daily_digest_enabled, daily_digest_time, weekly_report_enabled, weekly_report_day, pipeline_stall_days, recipient_emails, daily_export_enabled, export_recipient_emails)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (property_id) DO UPDATE SET
         daily_digest_enabled = EXCLUDED.daily_digest_enabled,
         daily_digest_time = EXCLUDED.daily_digest_time,
         weekly_report_enabled = EXCLUDED.weekly_report_enabled,
         weekly_report_day = EXCLUDED.weekly_report_day,
         pipeline_stall_days = EXCLUDED.pipeline_stall_days,
         recipient_emails = EXCLUDED.recipient_emails,
         daily_export_enabled = EXCLUDED.daily_export_enabled,
         export_recipient_emails = EXCLUDED.export_recipient_emails,
         updated_at = now()
       RETURNING *`,
      [PROPERTY_ID, daily_digest_enabled, daily_digest_time, weekly_report_enabled, weekly_report_day, pipeline_stall_days || 5, recipient_emails || [], daily_export_enabled ?? false, export_recipient_emails || []]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/digest', async (req, res) => {
  try {
    const settings = await pool.query('SELECT * FROM notification_settings WHERE property_id = $1', [PROPERTY_ID])
    if (!settings.rows.length || !settings.rows[0].daily_digest_enabled) {
      return res.json({ sent: false, reason: 'Daily digest disabled' })
    }

    const digest = await buildDigest(PROPERTY_ID)
    const recipients = settings.rows[0].recipient_emails || []

    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject: `LeaseFlow Daily Digest — ${new Date().toLocaleDateString()}`,
        html: digest,
      })
    }

    res.json({ sent: true, recipients: recipients.length, preview: digest })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/weekly', async (req, res) => {
  try {
    const settings = await pool.query('SELECT * FROM notification_settings WHERE property_id = $1', [PROPERTY_ID])
    if (!settings.rows.length || !settings.rows[0].weekly_report_enabled) {
      return res.json({ sent: false, reason: 'Weekly report disabled' })
    }

    const report = await buildWeeklyReport(PROPERTY_ID)
    const recipients = settings.rows[0].recipient_emails || []

    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject: `LeaseFlow Weekly Report — Week of ${getMonday(new Date()).toLocaleDateString()}`,
        html: report,
      })
    }

    res.json({ sent: true, recipients: recipients.length, preview: report })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Daily leasing export — generates the tours .xlsx and emails it as an
// attachment to the asset-control recipient list. Intended to run each morning
// via an external scheduler. Defaults to yesterday's activity; override with
// `from`/`to` (YYYY-MM-DD) in the body.
router.post('/daily-export', requireCronSecret, async (req, res) => {
  try {
    const settings = await pool.query('SELECT * FROM notification_settings WHERE property_id = $1', [PROPERTY_ID])
    if (!settings.rows.length || !settings.rows[0].daily_export_enabled) {
      return res.json({ sent: false, reason: 'Daily export disabled' })
    }

    const recipients = settings.rows[0].export_recipient_emails || []
    if (!recipients.length) {
      return res.json({ sent: false, reason: 'No export recipients configured' })
    }

    // Default window: yesterday (the day that just completed).
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const defaultDate = yesterday.toISOString().split('T')[0]
    const from = req.body?.from || defaultDate
    const to = req.body?.to || from

    const property = await pool.query('SELECT name FROM properties WHERE id = $1', [PROPERTY_ID])
    const propertyName = property.rows[0]?.name || 'Property'

    const buffer = await buildToursWorkbook(PROPERTY_ID, from, to, { title: 'Tours' })
    const rangeLabel = from === to ? from : `${from} to ${to}`
    const filename = from === to
      ? `leasing-export-${from}.xlsx`
      : `leasing-export-${from}_${to}.xlsx`

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1a1a1a;">
        <p>Attached is the daily leasing export for <strong>${propertyName}</strong>.</p>
        <p style="color:#555;">Reporting period: <strong>${rangeLabel}</strong></p>
        <p style="color:#888; font-size: 13px;">This is an automated report from LeaseFlow.</p>
      </div>`

    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject: `${propertyName} — Daily Leasing Export (${rangeLabel})`,
        html,
        attachments: [{ filename, content: buffer }],
      })
    }

    res.json({ sent: true, recipients: recipients.length, range: rangeLabel, filename })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  return date
}

export default router
