import { useState } from 'react'
import { Download } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import SlideOver from '../components/shared/SlideOver'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorBanner from '../components/shared/ErrorBanner'
import PipelineTable from '../components/pipeline/PipelineTable'
import KanbanBoard from '../components/pipeline/KanbanBoard'
import AppDetail from '../components/pipeline/AppDetail'
import { downloadCsv } from '../lib/downloadCsv'

export default function Pipeline() {
  const { applications, loading, error, moveStage, getHistory, refetch } = useApplications()
  const [view, setView] = useState('kanban')
  const [selected, setSelected] = useState(null)

  const handleMoveStage = async (appId, stage) => {
    await moveStage(appId, stage)
    setSelected((prev) => prev && prev.id === appId ? { ...prev, pipeline_stage: stage, days_in_stage: 0 } : prev)
  }

  const handleExport = () => {
    downloadCsv('/api/applications/export', `pipeline-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Pipeline</h1>
          <p className="text-sm text-text-secondary mt-1">Track applications through the leasing pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
            <Download size={16} strokeWidth={1.5} /> Export
          </button>
          <div className="flex bg-surface-hover rounded-md p-0.5">
            <button onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded cursor-pointer transition-colors duration-[150ms] ${
                view === 'table' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}>
              Table
            </button>
            <button onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded cursor-pointer transition-colors duration-[150ms] ${
                view === 'kanban' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}>
              Kanban
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorBanner message={error} onRetry={refetch} />
      ) : loading ? (
        <LoadingSpinner message="Loading pipeline…" />
      ) : view === 'table' ? (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <PipelineTable applications={applications} onSelect={setSelected} />
        </div>
      ) : (
        <KanbanBoard applications={applications} onMoveStage={handleMoveStage} onSelect={setSelected} />
      )}

      <SlideOver open={!!selected} onClose={() => setSelected(null)} title="Application Detail">
        <AppDetail app={selected} getHistory={getHistory} onMoveStage={handleMoveStage} />
      </SlideOver>
    </div>
  )
}
