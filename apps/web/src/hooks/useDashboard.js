import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useDashboard() {
  const [today, setToday] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [pipeline, setPipeline] = useState([])
  const [funnel, setFunnel] = useState(null)
  const [velocity, setVelocity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, w, p, f, v] = await Promise.all([
        api.get('/api/dashboard/today'),
        api.get('/api/dashboard/weekly'),
        api.get('/api/dashboard/pipeline'),
        api.get('/api/dashboard/funnel'),
        api.get('/api/dashboard/velocity'),
      ])
      setToday(t)
      setWeekly(w)
      setPipeline(p)
      setFunnel(f)
      setVelocity(v)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { today, weekly, pipeline, funnel, velocity, loading, error, refetch: fetchAll }
}
