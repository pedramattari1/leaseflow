export default function MetricCard({ label, value, icon: Icon, onClick }) {
  return (
    <div
      className={`bg-surface rounded-xl shadow-md p-6${onClick ? ' cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        {Icon && <Icon size={18} className="text-text-tertiary" strokeWidth={1.5} />}
      </div>
      <div className="text-3xl font-bold tabular-nums text-text-primary">{value}</div>
    </div>
  )
}
