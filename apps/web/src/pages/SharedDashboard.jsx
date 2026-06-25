import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardContent from '../components/dashboard/DashboardContent'

function getInitialDate() {
  const params = new URLSearchParams(window.location.search)
  return params.get('date') || new Date().toISOString().split('T')[0]
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

  const navigateDay = (dir) => {
    setSelectedDate(prev => {
      const d = new Date(prev + 'T00:00:00')
      d.setDate(d.getDate() + dir)
      return d.toISOString().split('T')[0]
    })
  }

  const goToday = () => setSelectedDate(new Date().toISOString().split('T')[0])

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

        <DashboardContent
          today={data.today}
          weekly={data.weekly}
          pipeline={data.pipeline}
          funnel={data.funnel}
          velocity={data.velocity}
          toursDetail={data.toursDetail}
          appsDetail={data.appsDetail}
          selectedDate={selectedDate}
          navigateDay={navigateDay}
          goToday={goToday}
        />

        <p className="text-center text-xs text-text-tertiary mt-12">Powered by LeaseFlow</p>
      </div>
    </div>
  )
}
