const STAGE_COLORS = {
  applied: '#2563EB',
  screening: '#7C3AED',
  approved: '#059669',
  lease_sent: '#D97706',
  lease_executed: '#047857',
  move_in_scheduled: '#0E7490',
}

const STAGE_LABELS = {
  applied: 'Applied',
  screening: 'Screening',
  approved: 'Approved',
  lease_sent: 'Lease Sent',
  lease_executed: 'Executed',
  move_in_scheduled: 'Move-in',
}

const STAGE_ORDER = ['applied', 'screening', 'approved', 'lease_sent', 'lease_executed', 'move_in_scheduled']

export default function PipelineOverview({ overview, stages = [] }) {
  if (!overview) return null

  const cards = [
    { label: 'Gross Applications', value: overview.gross ?? 0, sub: 'Total in pipeline', color: '#2563EB' },
    { label: 'Approved', value: overview.approved_pending ?? 0, sub: 'Pending signature', color: '#D97706' },
    { label: 'Lease Signed', value: overview.signed_pending ?? 0, sub: 'Pending move-in', color: '#047857' },
  ]

  const total = stages.reduce((s, d) => s + d.count, 0)
  const ordered = [...stages].sort(
    (a, b) => STAGE_ORDER.indexOf(a.pipeline_stage) - STAGE_ORDER.indexOf(b.pipeline_stage)
  )

  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Pipeline</h3>

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

      {total === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-6 mt-4 border-t border-border-subtle">
          No applications in the pipeline yet
        </p>
      ) : (
        <div className="mt-5 pt-5 border-t border-border-subtle">
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">By Stage</p>
          <div className="flex rounded-lg overflow-hidden h-6 mb-4">
            {ordered.filter((d) => d.count > 0).map((d) => (
              <div
                key={d.pipeline_stage}
                style={{ width: `${(d.count / total) * 100}%`, backgroundColor: STAGE_COLORS[d.pipeline_stage] || '#9CA3AF' }}
                className="flex items-center justify-center text-white text-[10px] font-medium min-w-[24px]"
              >
                {d.count}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {ordered.map((d) => (
              <div key={d.pipeline_stage} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[d.pipeline_stage] || '#9CA3AF' }} />
                  <span className="text-text-secondary">{STAGE_LABELS[d.pipeline_stage] || d.pipeline_stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium tabular-nums">{d.count}</span>
                  <span className="text-text-tertiary text-xs tabular-nums">{d.avg_days || 0}d avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
