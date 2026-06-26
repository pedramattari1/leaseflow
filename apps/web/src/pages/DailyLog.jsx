import { useState, useMemo, useEffect } from 'react'
import { Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useTours } from '../hooks/useTours'
import { useUnits } from '../hooks/useUnits'
import { useApplications } from '../hooks/useApplications'
import { api } from '../lib/api'
import SlideOver from '../components/shared/SlideOver'
import Modal from '../components/shared/Modal'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorBanner from '../components/shared/ErrorBanner'
import { downloadCsv } from '../lib/downloadCsv'
import TourDayTabs from '../components/tours/TourDayTabs'
import TourTable from '../components/tours/TourTable'
import TourSummary from '../components/tours/TourSummary'
import TourForm from '../components/tours/TourForm'

import { localToday, toLocalDateString } from '../lib/localDate'

function getMonday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return toLocalDateString(d)
}

function formatWeekLabel(weekStart) {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `Week of ${start.getMonth() + 1}/${start.getDate()} – ${end.getMonth() + 1}/${end.getDate()}`
}

export default function DailyLog() {
  const { tours, allTours, loading, error, selectedDate, setSelectedDate, weekStart, summary, createTour, updateTour, deleteTour, refetch } = useTours()
  const { units } = useUnits()
  const { createApplication } = useApplications()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [rentFloors, setRentFloors] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    api.get('/api/units/rent-floors').then(setRentFloors).catch(console.error)
  }, [])

  const tourCounts = useMemo(() => {
    const counts = {}
    for (const t of allTours) {
      const d = t.tour_date.split('T')[0]
      counts[d] = (counts[d] || 0) + 1
    }
    return counts
  }, [allTours])

  const navigateWeek = (dir) => {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() + dir * 7)
    setSelectedDate(toLocalDateString(d))
  }

  const goToday = () => setSelectedDate(localToday())

  const handleSubmit = async (form, isEdit) => {
    if (isEdit && editing) {
      await updateTour(editing.id, form)
    } else {
      const result = await createTour(form)
      return result
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDeleteRequest = (tour) => {
    setDeleteTarget(tour)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteTour(deleteTarget.id)
    setDeleteTarget(null)
    setShowForm(false)
    setEditing(null)
  }

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setEditing(null)
        setShowForm(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleExport = () => {
    downloadCsv(`/api/tours/export?week=${weekStart}`, `tours-${weekStart}.xlsx`)
  }

  const handleCreateApplication = async (tour) => {
    await createApplication({
      prospect_id: tour.prospect_id,
      unit_id: tour.unit_id,
      unit_type: tour.unit_type,
      unit_number: tour.unit_number,
      market_rent: tour.market_rent,
    })
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Daily Tour Log</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => navigateWeek(-1)}
              className="p-1 rounded hover:bg-surface-hover cursor-pointer">
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button onClick={goToday}
              className="px-2 py-0.5 text-xs font-medium border border-border rounded hover:bg-surface-hover cursor-pointer">
              Today
            </button>
            <button onClick={() => navigateWeek(1)}
              className="p-1 rounded hover:bg-surface-hover cursor-pointer">
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
            <span className="text-sm text-text-secondary ml-1">{formatWeekLabel(weekStart)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
            <Download size={16} strokeWidth={1.5} /> Export
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover cursor-pointer">
            <Plus size={16} strokeWidth={1.5} /> New Tour
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
        <TourDayTabs
          weekStart={weekStart}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          tourCounts={tourCounts}
        />

        {error ? (
          <div className="p-4"><ErrorBanner message={error} onRetry={refetch} /></div>
        ) : loading ? (
          <LoadingSpinner message="Loading tours…" />
        ) : (
          <>
            <TourTable tours={tours} onEdit={(t) => { setEditing(t); setShowForm(true) }} onDelete={handleDeleteRequest} />
            <TourSummary summary={summary} />
          </>
        )}
      </div>

      <SlideOver
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? 'Edit Tour' : 'New Tour'}>
        <TourForm
          tour={editing}
          units={units}
          rentFloors={rentFloors}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          onDelete={handleDeleteRequest}
          onCreateApplication={handleCreateApplication}
        />
      </SlideOver>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Tour"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
              Cancel
            </button>
            <button onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-error rounded-md hover:bg-error/90 cursor-pointer">
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete the tour for <strong>{deleteTarget?.prospect_name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
