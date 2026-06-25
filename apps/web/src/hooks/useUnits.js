import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useUnits() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUnits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/api/units')
      setUnits(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUnits() }, [fetchUnits])

  const createUnit = async (unit) => {
    const created = await api.post('/api/units', unit)
    setUnits((prev) => [...prev, created].sort((a, b) => a.unit_number.localeCompare(b.unit_number)))
    return created
  }

  const updateUnit = async (id, unit) => {
    const updated = await api.put(`/api/units/${id}`, unit)
    setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)))
    return updated
  }

  const deleteUnit = async (id) => {
    await api.del(`/api/units/${id}`)
    setUnits((prev) => prev.filter((u) => u.id !== id))
  }

  const importUnits = async (unitsList) => {
    const inserted = await api.post('/api/units/import', { units: unitsList })
    setUnits((prev) => [...prev, ...inserted].sort((a, b) => a.unit_number.localeCompare(b.unit_number)))
    return inserted
  }

  return { units, loading, error, createUnit, updateUnit, deleteUnit, importUnits, refetch: fetchUnits }
}
