import { CalendarDays, Users, FileCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import MetricCard from './MetricCard'
import WeeklyChart from './WeeklyChart'
import PipelineSummary from './PipelineSummary'
import ConversionFunnel from './ConversionFunnel'
import VelocityCard from './VelocityCard'
import TourDetail from './TourDetail'
import ApplicationsDetail from './ApplicationsDetail'

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split('T')[0]
}

export default function DashboardContent({
  today, weekly, pipeline, funnel, velocity, toursDetail, appsDetail,
  selectedDate, navigateDay, goToday,
  headerRight,
}) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => navigateDay(-1)}
              className="p-1 rounded hover:bg-surface-hover cursor-pointer">
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button onClick={goToday}
              className="px-2 py-0.5 text-xs font-medium border border-border rounded hover:bg-surface-hover cursor-pointer">
              Today
            </button>
            <button onClick={() => navigateDay(1)}
              className="p-1 rounded hover:bg-surface-hover cursor-pointer">
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
            <span className="text-sm text-text-secondary ml-1">{formatDateLabel(selectedDate)}</span>
          </div>
        </div>
        {headerRight}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <MetricCard
          label={isToday(selectedDate) ? 'Tours Today' : 'Tours'}
          value={today?.tours_today ?? 0}
          icon={CalendarDays}
          onClick={() => scrollTo('tours-detail')}
        />
        <MetricCard
          label="New Applications"
          value={today?.new_applications ?? 0}
          icon={Users}
          onClick={() => scrollTo('apps-detail')}
        />
        <MetricCard label="Leases This Week" value={today?.leases_this_week ?? 0} icon={FileCheck} />
      </div>

      <div className="mb-4"><TourDetail tours={toursDetail || []} /></div>
      <div className="mb-4"><ApplicationsDetail applications={appsDetail || []} /></div>

      {weekly && <div className="mb-4"><WeeklyChart data={weekly.data} weekOf={weekly.weekOf} /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <PipelineSummary data={pipeline || []} />
        <ConversionFunnel steps={funnel?.steps} />
      </div>

      {velocity && <VelocityCard avgDays={velocity.avg_days} />}
    </div>
  )
}
