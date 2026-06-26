import { useState } from 'react'

const STATUS_COLORS = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-blue-100 text-blue-700',
  applied: 'bg-green-100 text-green-700',
  not_interested: 'bg-gray-100 text-gray-500',
}

function NoteCell({ notes }) {
  const [expanded, setExpanded] = useState(false)
  if (!notes) return <td className="py-2.5 text-text-tertiary">—</td>
  const isLong = notes.length > 80
  return (
    <td className="py-2.5 text-text-tertiary max-w-[300px]">
      <span className={expanded ? '' : isLong ? 'line-clamp-2' : ''}>
        {notes}
      </span>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)}
          className="text-primary text-xs font-medium ml-1 cursor-pointer hover:underline">
          {expanded ? 'less' : 'more'}
        </button>
      )}
    </td>
  )
}

export default function TourDetail({ tours }) {
  return (
    <div id="tours-detail" className="bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Today's Tours</h3>
      {!tours.length ? (
        <p className="text-sm text-text-tertiary">No tours recorded for this date.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-tertiary uppercase tracking-wider border-b border-border">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Unit Type</th>
                <th className="pb-2 pr-4 font-medium">Rent</th>
                <th className="pb-2 pr-4 font-medium">Budget</th>
                <th className="pb-2 pr-4 font-medium">Move-in</th>
                <th className="pb-2 pr-4 font-medium">Source</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {tours.map((t) => (
                <tr key={t.id} className="hover:bg-surface-hover">
                  <td className="py-2.5 pr-4 font-medium text-text-primary whitespace-nowrap">{t.prospect_name}</td>
                  <td className="py-2.5 pr-4 text-text-secondary whitespace-nowrap">{t.unit_type || '—'}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-text-secondary whitespace-nowrap">
                    {t.market_rent ? `$${Number(t.market_rent).toLocaleString()}` : '—'}
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums text-text-secondary whitespace-nowrap">
                    {t.budget ? `$${Number(t.budget).toLocaleString()}` : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-text-secondary whitespace-nowrap">
                    {t.estimated_move_in ? new Date(t.estimated_move_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-text-secondary whitespace-nowrap">{t.source || '—'}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-500'}`}>
                      {t.status === 'not_interested' ? 'Not Interested' : t.status?.charAt(0).toUpperCase() + t.status?.slice(1)}
                    </span>
                  </td>
                  <NoteCell notes={t.notes} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
