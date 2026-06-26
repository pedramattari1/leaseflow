import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function WeekComparison({ data }) {
  if (!data || !data.length) return null

  const thisWeek = data.reduce((s, d) => s + (d.current || 0), 0)
  const lastWeek = data.reduce((s, d) => s + (d.prior || 0), 0)
  const delta = thisWeek - lastWeek
  const pct = lastWeek > 0 ? Math.round((delta / lastWeek) * 100) : null

  const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-text-tertiary'

  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Week-over-Week Tours</h3>
      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="flex flex-col">
          <span className="text-xs text-text-tertiary mb-1">This Week</span>
          <span className="text-2xl font-bold text-text-primary tabular-nums">{thisWeek}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-tertiary mb-1">Last Week</span>
          <span className="text-2xl font-bold text-text-secondary tabular-nums">{lastWeek}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${trendColor}`}>
          <Icon size={18} strokeWidth={2} />
          <span className="text-lg font-semibold tabular-nums">
            {delta > 0 ? '+' : ''}{delta}{pct !== null ? ` (${pct > 0 ? '+' : ''}${pct}%)` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
