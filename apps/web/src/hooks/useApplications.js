import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/api/applications')
      setApplications(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const createApplication = async (app) => {
    const created = await api.post('/api/applications', app)
    setApplications((prev) => [created, ...prev])
    return created
  }

  const updateApplication = async (id, app) => {
    const updated = await api.put(`/api/applications/${id}`, app)
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
    return updated
  }

  const moveStage = async (id, stage, notes) => {
    const updated = await api.put(`/api/applications/${id}/stage`, { stage, notes })
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated, days_in_stage: 0 } : a)))
    return updated
  }

  const getHistory = async (id) => {
    return api.get(`/api/applications/${id}/history`)
  }

  const deleteApplication = async (id) => {
    await api.del(`/api/applications/${id}`)
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  return { applications, loading, error, createApplication, updateApplication, moveStage, getHistory, deleteApplication, refetch: fetchApplications }
}
