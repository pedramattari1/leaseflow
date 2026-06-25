import { Clock } from 'lucide-react'

export default function VelocityCard({ avgDays }) {
  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={16} className="text-text-tertiary" strokeWidth={1.5} />
        <span className="text-sm text-text-secondary">Leasing Velocity (30d avg)</span>
      </div>
      <div className="text-3xl font-bold tabular-nums text-text-primary">
        {avgDays} <span className="text-lg font-normal text-text-secondary">days</span>
      </div>
      <p className="text-xs text-text-tertiary mt-1">Tour to lease execution</p>
    </div>
  )
}
