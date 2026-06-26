import { useState } from 'react'
import { CalendarDays, Users, FileCheck } from 'lucide-react'

const PERIODS = [
  { key: 'mtd', label: 'Month to Date' },
  { key: 'ytd', label: 'Year to Date' },
]

export default function PeriodStats({ stats }) {
  const [period, setPeriod] = useState('mtd')
  if (!stats) return null

  const metrics = [
    { label: 'Tours', value: stats[`${period}_tours`] ?? 0, icon: CalendarDays },
    { label: 'Applications', value: stats[`${period}_applications`] ?? 0, icon: Users },
    { label: 'Leases Executed', value: stats[`${period}_leases`] ?? 0, icon: FileCheck },
  ]

  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Performance Summary</h3>
        <div className="flex bg-surface-hover rounded-md p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer transition-colors duration-[150ms] ${
                period === p.key ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="flex flex-col">
              <div className="flex items-center gap-1.5 text-text-tertiary mb-1">
                <Icon size={14} strokeWidth={1.5} />
                <span className="text-xs">{m.label}</span>
              </div>
              <span className="text-2xl font-bold text-text-primary tabular-nums">{m.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
