import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useDashboard(initialDate) {
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  )
  const [today, setToday] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [pipeline, setPipeline] = useState([])
  const [funnel, setFunnel] = useState(null)
  const [velocity, setVelocity] = useState(null)
  const [toursDetail, setToursDetail] = useState([])
  const [appsDetail, setAppsDetail] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async (date) => {
    setLoading(true)
    setError(null)
    try {
      const [t, w, p, f, v, td, ad] = await Promise.all([
        api.get(`/api/dashboard/today?date=${date}`),
        api.get(`/api/dashboard/weekly?date=${date}`),
        api.get('/api/dashboard/pipeline'),
        api.get('/api/dashboard/funnel'),
        api.get('/api/dashboard/velocity'),
        api.get(`/api/dashboard/tours-detail?date=${date}`),
        api.get('/api/dashboard/apps-detail'),
      ])
      setToday(t)
      setWeekly(w)
      setPipeline(p)
      setFunnel(f)
      setVelocity(v)
      setToursDetail(td)
      setAppsDetail(ad)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll(selectedDate) }, [selectedDate, fetchAll])

  const navigateDay = (dir) => {
    setSelectedDate(prev => {
      const d = new Date(prev + 'T00:00:00')
      d.setDate(d.getDate() + dir)
      return d.toISOString().split('T')[0]
    })
  }

  const goToday = () => setSelectedDate(new Date().toISOString().split('T')[0])

  return {
    today, weekly, pipeline, funnel, velocity, toursDetail, appsDetail,
    loading, error, refetch: () => fetchAll(selectedDate),
    selectedDate, setSelectedDate, navigateDay, goToday,
  }
}
