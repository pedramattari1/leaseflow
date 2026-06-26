export default function PipelineOverview({ overview }) {
  if (!overview) return null

  const cards = [
    { label: 'Gross Applications', value: overview.gross ?? 0, sub: 'Total in pipeline', color: '#2563EB' },
    { label: 'Approved', value: overview.approved_pending ?? 0, sub: 'Pending signature', color: '#D97706' },
    { label: 'Lease Signed', value: overview.signed_pending ?? 0, sub: 'Pending move-in', color: '#047857' },
  ]

  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Pipeline Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs text-text-tertiary">{c.label}</span>
            </div>
            <span className="text-2xl font-bold text-text-primary tabular-nums">{c.value}</span>
            <span className="text-xs text-text-tertiary mt-0.5">{c.sub}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
