import StatusBadge from '../shared/StatusBadge'

const statuses = [
  { key: 'hot', label: 'Hot' },
  { key: 'warm', label: 'Warm' },
  { key: 'cold', label: 'Cold' },
  { key: 'applied', label: 'Applied' },
  { key: 'not_interested', label: 'Not Interested' },
]

export default function TourSummary({ summary }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-surface-hover/50 border-t border-border">
      {statuses.map((s) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <StatusBadge value={s.key} />
          <span className="text-sm tabular-nums font-medium text-text-primary">{summary[s.key] || 0}</span>
        </div>
      ))}
      <div className="ml-auto text-sm font-semibold text-text-primary tabular-nums">
        Total: {summary.total || 0}
      </div>
    </div>
  )
}
