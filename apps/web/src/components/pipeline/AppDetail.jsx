import { useState, useEffect } from 'react'
import StatusBadge from '../shared/StatusBadge'

const STAGES = [
  { key: 'applied', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'approved', label: 'Approved' },
  { key: 'lease_sent', label: 'Lease Sent' },
  { key: 'lease_executed', label: 'Lease Executed' },
  { key: 'move_in_scheduled', label: 'Move-in Scheduled' },
]

function fmtDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateTime(val) {
  if (!val) return ''
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function AppDetail({ app, getHistory, onMoveStage }) {
  const [history, setHistory] = useState([])
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    if (app && getHistory) {
      getHistory(app.id).then(setHistory).catch(() => setHistory([]))
    }
  }, [app?.id, app?.pipeline_stage])

  if (!app) return null

  const handleStageChange = async (e) => {
    const newStage = e.target.value
    if (newStage === app.pipeline_stage || !onMoveStage) return
    setMoving(true)
    try {
      await onMoveStage(app.id, newStage)
    } finally {
      setMoving(false)
    }
  }

  const details = [
    ['Name', app.prospect_name],
    ['Email', app.prospect_email],
    ['Phone', app.prospect_phone],
    ['Unit #', app.unit_number],
    ['Unit Type', app.unit_type],
    ['Market Rent', app.market_rent ? `$${Number(app.market_rent).toLocaleString()}` : '—'],
    ['App Submitted', fmtDate(app.app_submitted_date)],
    ['Approval Date', fmtDate(app.approval_date)],
    ['Lease Target', fmtDate(app.lease_execution_target)],
    ['Lease Executed', fmtDate(app.lease_execution_date)],
    ['Move-in Date', fmtDate(app.move_in_date)],
    ['Days in Stage', app.days_in_stage ?? 0],
    ['Notes', app.notes || '—'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-text-primary">{app.prospect_name}</h3>
        <StatusBadge value={app.pipeline_stage} type="stage" />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">Move to</label>
        <select
          value={app.pipeline_stage}
          onChange={handleStageChange}
          disabled={moving}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer disabled:opacity-50"
        >
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {details.map(([label, value]) => (
          <div key={label} className={label === 'Notes' ? 'col-span-2' : ''}>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
            <p className="text-sm text-text-primary mt-0.5">{value || '—'}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">Stage History</h4>
        {history.length === 0 ? (
          <p className="text-sm text-text-tertiary">No history yet.</p>
        ) : (
          <div className="relative pl-4 border-l-2 border-border space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface" />
                <div>
                  <p className="text-sm text-text-primary">
                    {entry.from_stage ? (
                      <><StatusBadge value={entry.from_stage} type="stage" /> → <StatusBadge value={entry.to_stage} type="stage" /></>
                    ) : (
                      <>Created as <StatusBadge value={entry.to_stage} type="stage" /></>
                    )}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">{fmtDateTime(entry.changed_at)}</p>
                  {entry.notes && <p className="text-xs text-text-secondary mt-1">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
