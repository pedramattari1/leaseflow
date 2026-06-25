import { useState } from 'react'
import { Layers } from 'lucide-react'
import StatusBadge from '../shared/StatusBadge'

function fmt(val) {
  if (val == null || val === '') return '—'
  return `$${Number(val).toLocaleString()}`
}

function fmtDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const columns = [
  { key: 'prospect_name', label: 'Name', sortable: true, className: 'font-medium min-w-[140px]' },
  { key: 'unit_number', label: 'Unit #', sortable: true },
  { key: 'unit_type', label: 'Unit Type', sortable: true },
  { key: 'market_rent', label: 'Market Rent', sortable: true, format: fmt, className: 'text-right tabular-nums' },
  { key: 'pipeline_stage', label: 'Stage', sortable: true },
  { key: 'app_submitted_date', label: 'App Submitted', sortable: true, format: fmtDate },
  { key: 'approval_date', label: 'Approval', format: fmtDate },
  { key: 'lease_execution_target', label: 'Lease Target', format: fmtDate },
  { key: 'days_in_stage', label: 'Days', sortable: true, className: 'text-right tabular-nums' },
  { key: 'notes', label: 'Notes', className: 'max-w-[200px] truncate' },
]

export default function PipelineTable({ applications, onSelect }) {
  const [sortKey, setSortKey] = useState('app_submitted_date')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = [...applications].sort((a, b) => {
    const aVal = a[sortKey] ?? ''
    const bVal = b[sortKey] ?? ''
    const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  if (applications.length === 0) {
    return (
      <div className="py-16 text-center">
        <Layers size={40} className="mx-auto text-text-tertiary mb-3" strokeWidth={1} />
        <p className="text-sm text-text-secondary">No applications in the pipeline.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-hover">
            {columns.map((col) => (
              <th key={col.key}
                onClick={() => col.sortable && toggleSort(col.key)}
                className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap ${
                  col.sortable ? 'cursor-pointer hover:text-text-primary' : ''
                } ${col.className?.includes('text-right') ? 'text-right' : ''}`}>
                {col.label}
                {sortKey === col.key && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((app) => (
            <tr key={app.id}
              onClick={() => onSelect(app)}
              className="border-t border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors duration-[150ms]">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm whitespace-nowrap ${col.className || ''}`}>
                  {col.key === 'pipeline_stage' ? (
                    <StatusBadge value={app.pipeline_stage} type="stage" />
                  ) : col.format ? (
                    col.format(app[col.key])
                  ) : (
                    app[col.key] || '—'
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
