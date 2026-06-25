import { ClipboardList, Trash2 } from 'lucide-react'
import StatusBadge from '../shared/StatusBadge'

function fmt(val) {
  if (val == null || val === '' || val === '0' || val === 0) return '—'
  return `$${Number(val).toLocaleString()}`
}

function varianceClass(val) {
  if (val == null || val === '' || Number(val) === 0) return 'text-text-tertiary'
  return Number(val) > 0 ? 'text-success' : 'text-error'
}

const columns = [
  { key: 'prospect_name', label: 'Name', className: 'font-medium min-w-[140px]' },
  { key: 'unit_type', label: 'Unit Type' },
  { key: 'unit_number', label: 'Unit #' },
  { key: 'market_rent', label: 'Market Rent', format: fmt, className: 'text-right tabular-nums' },
  { key: 'concession', label: 'Concession', format: fmt, className: 'text-right tabular-nums' },
  { key: 'effective_rent', label: 'Eff. Rent', format: fmt, className: 'text-right tabular-nums' },
  { key: 'budget', label: 'Budget', format: fmt, className: 'text-right tabular-nums' },
  { key: 'variance', label: 'Variance', format: fmt, className: 'text-right tabular-nums', colorFn: varianceClass },
  { key: 'comps_toured', label: 'Comps', className: 'text-right tabular-nums' },
  { key: 'desired_term', label: 'Term' },
  { key: 'profession', label: 'Profession' },
  { key: 'num_vehicles', label: 'Vehicles', className: 'text-right tabular-nums' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes', className: 'max-w-[200px] truncate' },
]

export default function TourTable({ tours, onEdit, onDelete }) {
  if (tours.length === 0) {
    return (
      <div className="py-16 text-center">
        <ClipboardList size={40} className="mx-auto text-text-tertiary mb-3" strokeWidth={1} />
        <p className="text-sm text-text-secondary">No tours logged for this day.</p>
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
                className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap ${
                  col.className?.includes('text-right') ? 'text-right' : ''
                }`}>
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody>
          {tours.map((tour) => (
            <tr key={tour.id}
              onClick={() => onEdit(tour)}
              className="border-t border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors duration-[150ms]">
              {columns.map((col) => (
                <td key={col.key}
                  className={`px-4 py-3 text-sm whitespace-nowrap ${col.className || ''} ${
                    col.colorFn ? col.colorFn(tour[col.key]) : ''
                  }`}>
                  {col.key === 'status' ? (
                    <StatusBadge value={tour.status} />
                  ) : col.format ? (
                    col.format(tour[col.key])
                  ) : (
                    tour[col.key] || '—'
                  )}
                </td>
              ))}
              <td className="px-4 py-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(tour) }}
                  className="p-1.5 rounded-md hover:bg-error-bg cursor-pointer transition-colors"
                >
                  <Trash2 size={14} className="text-text-tertiary hover:text-error" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
