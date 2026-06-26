import ExcelJS from 'exceljs'
import { pool } from '../db/index.js'

const COLUMNS = [
  { header: 'Date', key: 'tour_date', width: 12 },
  { header: 'Name', key: 'name', width: 22 },
  { header: 'Email', key: 'email', width: 26 },
  { header: 'Phone', key: 'phone', width: 16 },
  { header: 'Unit', key: 'unit_number', width: 10 },
  { header: 'Type', key: 'unit_type', width: 12 },
  { header: 'Market Rent', key: 'market_rent', width: 13 },
  { header: 'Concession', key: 'concession', width: 12 },
  { header: 'Eff. Rent', key: 'effective_rent', width: 12 },
  { header: 'Budget', key: 'budget', width: 12 },
  { header: 'Variance', key: 'variance', width: 11 },
  { header: 'Comps', key: 'comps_toured', width: 8 },
  { header: 'Term', key: 'desired_term', width: 8 },
  { header: 'Est. Move-in', key: 'estimated_move_in', width: 13 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Notes', key: 'notes', width: 40 },
  { header: 'Profession', key: 'profession', width: 18 },
  { header: 'Vehicles', key: 'num_vehicles', width: 9 },
  { header: 'Source', key: 'source', width: 14 },
]

const MONEY_KEYS = new Set(['market_rent', 'concession', 'effective_rent', 'budget', 'variance'])

function toDateStr(d) {
  return d instanceof Date ? d.toISOString().split('T')[0] : d || ''
}

/**
 * Fetch tour rows for a property between two inclusive dates (YYYY-MM-DD).
 */
export async function fetchToursForExport(propertyId, fromDate, toDate) {
  const { rows } = await pool.query(
    `SELECT t.tour_date, p.name, p.email, p.phone, t.unit_number, t.unit_type,
            t.market_rent, t.concession, t.effective_rent, t.budget, t.variance,
            t.comps_toured, t.desired_term, t.estimated_move_in, t.status, t.notes,
            p.profession, p.num_vehicles, p.source
     FROM tours t JOIN prospects p ON t.prospect_id = p.id
     WHERE t.property_id = $1 AND t.tour_date >= $2::date AND t.tour_date <= $3::date
     ORDER BY t.tour_date, t.created_at`,
    [propertyId, fromDate, toDate]
  )
  return rows
}

/**
 * Build an .xlsx workbook of tour rows. Returns a Node Buffer.
 */
export async function buildToursWorkbook(propertyId, fromDate, toDate, { title } = {}) {
  const rows = await fetchToursForExport(propertyId, fromDate, toDate)

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'LeaseFlow'
  workbook.created = new Date()
  const sheet = workbook.addWorksheet(title || 'Tours')

  sheet.columns = COLUMNS
  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' },
  }
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + COLUMNS.length)}1` }

  for (const r of rows) {
    sheet.addRow({
      ...r,
      tour_date: toDateStr(r.tour_date),
      estimated_move_in: toDateStr(r.estimated_move_in),
    })
  }

  COLUMNS.forEach((col, i) => {
    if (MONEY_KEYS.has(col.key)) {
      sheet.getColumn(i + 1).numFmt = '$#,##0.00'
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
