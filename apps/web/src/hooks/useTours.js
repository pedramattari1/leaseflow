import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../lib/api'
import { localToday, toLocalDateString } from '../lib/localDate'

function getMonday(date) {
  const d = new Date(date + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return toLocalDateString(d)
}

export function useTours() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(localToday())
  const [summary, setSummary] = useState({ hot: 0, warm: 0, cold: 0, applied: 0, not_interested: 0, total: 0 })

  const weekStart = useMemo(() => getMonday(selectedDate), [selectedDate])

  const fetchTours = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [toursData, summaryData] = await Promise.all([
        api.get(`/api/tours?week=${weekStart}`),
        api.get(`/api/tours/summary?date=${selectedDate}`),
      ])
      setTours(toursData)
      setSummary(summaryData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [weekStart, selectedDate])

  useEffect(() => { fetchTours() }, [fetchTours])

  const toursForDate = useMemo(
    () => tours.filter((t) => t.tour_date.split('T')[0] === selectedDate),
    [tours, selectedDate]
  )

  const createTour = async (tour) => {
    const created = await api.post('/api/tours', { ...tour, tour_date: selectedDate })
    await fetchTours()
    return created
  }

  const updateTour = async (id, tour) => {
    const updated = await api.put(`/api/tours/${id}`, tour)
    await fetchTours()
    return updated
  }

  const deleteTour = async (id) => {
    await api.del(`/api/tours/${id}`)
    await fetchTours()
  }

  return {
    tours: toursForDate,
    allTours: tours,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    weekStart,
    summary,
    createTour,
    updateTour,
    deleteTour,
    refetch: fetchTours,
  }
}
