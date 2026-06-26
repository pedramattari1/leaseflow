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

export default function PipelineSummary({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Pipeline Summary</h3>
      {total > 0 && (
        <div className="flex rounded-lg overflow-hidden h-6 mb-4">
          {data.filter((d) => d.count > 0).map((d) => (
            <div
              key={d.pipeline_stage}
              style={{ width: `${(d.count / total) * 100}%`, backgroundColor: STAGE_COLORS[d.pipeline_stage] || '#9CA3AF' }}
              className="flex items-center justify-center text-white text-[10px] font-medium min-w-[24px]"
            >
              {d.count}
            </div>
          ))}
        </div>
      )}
      {total === 0 && (
        <p className="text-sm text-text-tertiary text-center py-6">No applications in the pipeline yet</p>
      )}
      <div className="space-y-2">
        {data.map((d) => (
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
  )
}
