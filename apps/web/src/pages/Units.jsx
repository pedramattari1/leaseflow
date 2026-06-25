import { useState } from 'react'
import { Plus, Upload, Trash2, Building2 } from 'lucide-react'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorBanner from '../components/shared/ErrorBanner'
import { useUnits } from '../hooks/useUnits'
import SlideOver from '../components/shared/SlideOver'
import Modal from '../components/shared/Modal'
import UnitForm from '../components/units/UnitForm'
import CSVImport from '../components/units/CSVImport'

const statusColors = {
  available: 'text-applied',
  occupied: 'text-warm',
  notice: 'text-hot',
  down: 'text-not-interested',
}

function fmt(val) {
  if (val == null || val === '') return '—'
  return `$${Number(val).toLocaleString()}`
}

export default function Units() {
  const { units, loading, error, createUnit, updateUnit, deleteUnit, importUnits, refetch } = useUnits()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const handleSubmit = async (form) => {
    if (editing) await updateUnit(editing.id, form)
    else await createUnit(form)
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (deleting) await deleteUnit(deleting.id)
    setDeleting(null)
  }

  const handleImport = async (unitsList) => {
    await importUnits(unitsList)
    setShowImport(false)
  }

  return (
    <div>
      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={refetch} /></div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Units</h1>
          <p className="text-sm text-text-secondary mt-1">Manage property unit mix and availability.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
            <Upload size={16} strokeWidth={1.5} /> Import CSV
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover cursor-pointer">
            <Plus size={16} strokeWidth={1.5} /> Add Unit
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading units…" />
        ) : units.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={40} className="mx-auto text-text-tertiary mb-3" strokeWidth={1} />
            <p className="text-sm text-text-secondary">No units yet. Add units or import from CSV.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-hover">
                {['Unit #', 'Type', 'Floor', 'Market Rent', 'Sqft', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}
                  onClick={() => { setEditing(unit); setShowForm(true) }}
                  className="border-t border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors duration-[150ms]">
                  <td className="px-4 py-3 text-sm font-medium">{unit.unit_number}</td>
                  <td className="px-4 py-3 text-sm">{unit.unit_type}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{unit.floor || '—'}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums">{fmt(unit.market_rent)}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums">{unit.sqft ? unit.sqft.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium capitalize ${statusColors[unit.status] || ''}`}>{unit.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); setDeleting(unit) }}
                      className="p-1.5 rounded-md hover:bg-error-bg text-text-tertiary hover:text-error cursor-pointer">
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver open={showForm} onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? 'Edit Unit' : 'Add Unit'}>
        <UnitForm unit={editing} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null) }} />
      </SlideOver>

      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Units from CSV">
        <CSVImport onImport={handleImport} onCancel={() => setShowImport(false)} />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Unit"
        footer={
          <>
            <button onClick={() => setDeleting(null)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
              Cancel
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-error border border-error rounded-md hover:bg-error-bg cursor-pointer">
              Delete
            </button>
          </>
        }>
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete unit <strong>{deleting?.unit_number}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
