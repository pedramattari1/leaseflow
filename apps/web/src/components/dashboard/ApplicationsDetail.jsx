const STAGE_COLORS = {
  applied: '#2563EB',
  screening: '#7C3AED',
  approved: '#059669',
  lease_sent: '#D97706',
}

const STAGE_LABELS = {
  applied: 'Applied',
  screening: 'Screening',
  approved: 'Approved',
  lease_sent: 'Lease Sent',
}

const STAGE_ORDER = ['applied', 'screening', 'approved', 'lease_sent']

function getUrgency(targetDate) {
  if (!targetDate) return null
  const target = new Date(targetDate)
  const now = new Date()
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'urgent'
  return null
}

export default function ApplicationsDetail({ applications }) {
  const grouped = STAGE_ORDER.reduce((acc, stage) => {
    const apps = applications.filter(a => a.pipeline_stage === stage)
    if (apps.length) acc.push({ stage, apps })
    return acc
  }, [])

  return (
    <div id="apps-detail" className="bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Active Applications</h3>
      {!applications.length ? (
        <p className="text-sm text-text-tertiary">No active applications.</p>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ stage, apps }) => (
            <div key={stage}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  {STAGE_LABELS[stage]} ({apps.length})
                </span>
              </div>
              <div className="space-y-1">
                {apps.map(app => {
                  const urgency = getUrgency(app.lease_execution_target)
                  return (
                    <div key={app.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-hover text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-text-primary">{app.prospect_name}</span>
                        <span className="text-text-tertiary">
                          {app.unit_type}{app.unit_number ? ` #${app.unit_number}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-text-tertiary tabular-nums">{app.days_in_stage || 0}d in stage</span>
                        {app.lease_execution_target && (
                          <span className={`text-xs tabular-nums ${
                            urgency === 'overdue' ? 'text-error font-medium' :
                            urgency === 'urgent' ? 'text-warning font-medium' :
                            'text-text-tertiary'
                          }`}>
                            Target: {new Date(app.lease_execution_target).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
