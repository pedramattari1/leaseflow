export default function ConversionFunnel({ steps }) {
  if (!steps || !steps.length) return null

  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Conversion Funnel (30d)</h3>
      <div className="space-y-1">
        {steps.map((step, i) => {
          const maxCount = steps[0].count || 1
          const pct = Math.max(((step.count / maxCount) * 100), 8)
          const conversionPct = i > 0 && steps[i - 1].count > 0 && step.count <= steps[i - 1].count
            ? ((step.count / steps[i - 1].count) * 100).toFixed(0)
            : null

          return (
            <div key={step.label}>
              {conversionPct && (
                <div className="flex items-center justify-center py-0.5">
                  <span className="text-[11px] text-text-tertiary">↓ {conversionPct}%</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-20 text-xs text-text-secondary text-right shrink-0">{step.label}</div>
                <div className="flex-1 h-7 bg-surface-hover rounded relative overflow-hidden">
                  <div
                    className="h-full bg-primary rounded flex items-center justify-end pr-2"
                    style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }}
                  >
                    <span className="text-xs font-medium text-white tabular-nums">{step.count}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
