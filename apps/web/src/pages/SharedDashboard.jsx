import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { localToday } from '../lib/localDate'
import DashboardContent from '../components/dashboard/DashboardContent'
import PeriodStats from '../components/dashboard/PeriodStats'
import PipelineOverview from '../components/dashboard/PipelineOverview'
import WeekComparison from '../components/dashboard/WeekComparison'

function getInitialDate() {
  const params = new URLSearchParams(window.location.search)
  return params.get('date') || localToday()
}

export default function SharedDashboard() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(getInitialDate)

  const fetchData = useCallback(async (date) => {
    try {
      const d = await api.get(`/api/share/${token}/dashboard?date=${date}`)
      setData(d)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [token])

  useEffect(() => {
    fetchData(selectedDate)
    const interval = setInterval(() => fetchData(selectedDate), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedDate, fetchData])

  const goToday = () => setSelectedDate(localToday())

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-text-primary mb-2">Dashboard Unavailable</h1>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-text-secondary">Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1120px] mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-text-primary">{data.property_name}</h1>
          <div className="w-10 h-0.5 bg-accent mx-auto my-3" />
          <p className="text-sm font-medium text-text-secondary">Live Leasing Metrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <PeriodStats stats={data.periodStats} />
          <WeekComparison data={data.weekly?.data} />
        </div>

        <div className="mb-4">
          <PipelineOverview overview={data.pipelineOverview} stages={data.pipeline} />
        </div>

        <DashboardContent
          today={data.today}
          weekly={data.weekly}
          pipeline={data.pipeline}
          funnel={data.funnel}
          velocity={data.velocity}
          toursDetail={data.toursDetail}
          appsDetail={data.appsDetail}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          goToday={goToday}
          showPipelineSummary={false}
        />

        <p className="text-center text-xs text-text-tertiary mt-12">Powered by LeaseFlow</p>
      </div>
    </div>
  )
}
