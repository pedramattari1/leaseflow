import { localToday, toLocalDateString } from '../../lib/localDate'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(weekStart) {
  const start = new Date(weekStart + 'T00:00:00')
  return DAYS.map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return toLocalDateString(d)
  })
}

export default function TourDayTabs({ weekStart, selectedDate, onSelect, tourCounts = {} }) {
  const dates = getWeekDates(weekStart)
  const today = localToday()

  return (
    <div className="flex border-b border-border">
      {DAYS.map((day, i) => {
        const date = dates[i]
        const isActive = date === selectedDate
        const isToday = date === today
        const count = tourCounts[date] || 0
        const dayNum = new Date(date + 'T00:00:00').getDate()

        return (
          <button key={day} onClick={() => onSelect(date)}
            className={`flex flex-col items-center px-3 py-2.5 text-sm font-medium relative cursor-pointer transition-colors duration-[150ms] ${
              isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}>
            <span className="text-xs">{day}</span>
            <span className="tabular-nums">{dayNum}</span>
            {count > 0 && (
              <span className="text-[10px] text-text-tertiary tabular-nums">{count}</span>
            )}
            {isToday && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        )
      })}
    </div>
  )
}
