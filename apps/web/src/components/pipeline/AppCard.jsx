import StatusBadge from '../shared/StatusBadge'

export default function AppCard({ app, onClick, provided, snapshot }) {
  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg p-4 cursor-pointer transition-shadow duration-[150ms] ${
        snapshot?.isDragging ? 'shadow-lg rotate-1 opacity-90' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <p className="text-sm font-semibold text-text-primary">{app.prospect_name}</p>
      <p className="text-xs text-text-secondary mt-1">
        {app.unit_number ? `Unit ${app.unit_number}` : ''}{app.unit_type ? ` · ${app.unit_type}` : ''}
      </p>
      {app.market_rent && (
        <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
          ${Number(app.market_rent).toLocaleString()}/mo
        </p>
      )}
      <div className="flex items-center justify-between mt-3">
        <StatusBadge value={app.pipeline_stage} type="stage" />
        <span className="text-xs text-text-tertiary tabular-nums">{app.days_in_stage || 0}d</span>
      </div>
      {app.notes && (
        <p className="text-xs text-text-tertiary mt-2 truncate max-w-full">{app.notes}</p>
      )}
    </div>
  )
}
