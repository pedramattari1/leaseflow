import { useState } from 'react'
import { CalendarDays, Users, FileCheck, Share2 } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import ErrorBanner from '../components/shared/ErrorBanner'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import MetricCard from '../components/dashboard/MetricCard'
import WeeklyChart from '../components/dashboard/WeeklyChart'
import PipelineSummary from '../components/dashboard/PipelineSummary'
import ConversionFunnel from '../components/dashboard/ConversionFunnel'
import VelocityCard from '../components/dashboard/VelocityCard'
import ShareModal from '../components/dashboard/ShareModal'

export default function Dashboard() {
  const { today, weekly, pipeline, funnel, velocity, loading, error, refetch } = useDashboard()
  const [shareOpen, setShareOpen] = useState(false)

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <LoadingSpinner message="Loading metrics…" />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <div className="mt-4"><ErrorBanner message={error} onRetry={refetch} /></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Leasing metrics and performance overview.</p>
        </div>
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover cursor-pointer"
        >
          <Share2 size={16} strokeWidth={1.5} />
          Share
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <MetricCard label="Tours Today" value={today?.tours_today ?? 0} icon={CalendarDays} />
        <MetricCard label="New Applications" value={today?.new_applications ?? 0} icon={Users} />
        <MetricCard label="Leases This Week" value={today?.leases_this_week ?? 0} icon={FileCheck} />
      </div>

      {weekly && <div className="mb-4"><WeeklyChart data={weekly.data} weekOf={weekly.weekOf} /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <PipelineSummary data={pipeline} />
        <ConversionFunnel steps={funnel?.steps} />
      </div>

      {velocity && <VelocityCard avgDays={velocity.avg_days} />}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
