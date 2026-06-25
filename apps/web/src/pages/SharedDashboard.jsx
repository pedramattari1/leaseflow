import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import MetricCard from '../components/dashboard/MetricCard'
import PipelineSummary from '../components/dashboard/PipelineSummary'
import ConversionFunnel from '../components/dashboard/ConversionFunnel'
import VelocityCard from '../components/dashboard/VelocityCard'
import { CalendarDays, Users, FileCheck } from 'lucide-react'

export default function SharedDashboard() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [token])

  async function fetchData() {
    try {
      const d = await api.get(`/api/share/${token}/dashboard`)
      setData(d)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <MetricCard label="Tours Today" value={data.today?.tours_today ?? 0} icon={CalendarDays} />
          <MetricCard label="New Applications" value={data.today?.new_applications ?? 0} icon={Users} />
          <MetricCard label="Leases This Week" value={data.today?.leases_this_week ?? 0} icon={FileCheck} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <PipelineSummary data={data.pipeline} />
          <ConversionFunnel steps={data.funnel?.steps} />
        </div>

        {data.velocity && <VelocityCard avgDays={data.velocity.avg_days} />}

        <p className="text-center text-xs text-text-tertiary mt-12">Powered by LeaseFlow</p>
      </div>
    </div>
  )
}
