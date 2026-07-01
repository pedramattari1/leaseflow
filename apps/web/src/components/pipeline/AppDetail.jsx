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

export default function AppDetail({ app, getHistory, onMoveStage, onDelete, onUpdate }) {
  const [history, setHistory] = useState([])
  const [moving, setMoving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [unit, setUnit] = useState({ unit_number: '', unit_type: '', market_rent: '' })
  const [savingUnit, setSavingUnit] = useState(false)

  useEffect(() => {
    if (app && getHistory) {
      getHistory(app.id).then(setHistory).catch(() => setHistory([]))
    }
  }, [app?.id, app?.pipeline_stage])

  useEffect(() => {
    if (app) {
      setUnit({
        unit_number: app.unit_number || '',
        unit_type: app.unit_type || '',
        market_rent: app.market_rent != null ? String(app.market_rent) : '',
      })
    }
  }, [app?.id])

  if (!app) return null

  const unitChanged = app && (
    (unit.unit_number || '') !== (app.unit_number || '') ||
    (unit.unit_type || '') !== (app.unit_type || '') ||
    (unit.market_rent || '') !== (app.market_rent != null ? String(app.market_rent) : '')
  )

  const saveUnit = async () => {
    if (!onUpdate) return
    setSavingUnit(true)
    try {
      await onUpdate(app.id, {
        ...app,
        unit_number: unit.unit_number || null,
        unit_type: unit.unit_type || null,
        market_rent: unit.market_rent !== '' ? Number(unit.market_rent) : null,
      })
    } finally {
      setSavingUnit(false)
    }
  }

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

      {onUpdate && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-primary">Applied Unit</h4>
            {unitChanged && (
              <button
                onClick={saveUnit}
                disabled={savingUnit}
                className="px-3 py-1 text-xs font-semibold text-white bg-primary rounded-md hover:bg-primary-hover cursor-pointer disabled:opacity-50"
              >
                {savingUnit ? 'Saving…' : 'Save'}
              </button>
            )}
          </div>
          <p className="text-xs text-text-tertiary -mt-1">Narrow this down to the specific unit the applicant chose.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Unit #</label>
              <input
                type="text"
                value={unit.unit_number}
                onChange={(e) => setUnit((u) => ({ ...u, unit_number: e.target.value }))}
                placeholder="e.g. 716"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Unit Type</label>
              <input
                type="text"
                value={unit.unit_type}
                onChange={(e) => setUnit((u) => ({ ...u, unit_type: e.target.value }))}
                placeholder="e.g. 1bd 1ba B"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Market Rent</label>
              <input
                type="number"
                min="0"
                value={unit.market_rent}
                onChange={(e) => setUnit((u) => ({ ...u, market_rent: e.target.value }))}
                placeholder="e.g. 3730"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
            </div>
          </div>
        </div>
      )}

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

      {onDelete && (
        <div className="pt-4 border-t border-border">
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Delete this application?</span>
              <button onClick={() => { onDelete(app.id); setConfirmDelete(false) }}
                className="px-3 py-1.5 text-sm font-semibold text-white bg-error rounded-md hover:bg-error/90 cursor-pointer">
                Confirm
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-sm font-medium text-error border border-error/30 rounded-md hover:bg-error/5 cursor-pointer">
              Delete Application
            </button>
          )}
        </div>
      )}
    </div>
  )
}
