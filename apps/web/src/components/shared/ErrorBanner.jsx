import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-error-bg border border-error/20 rounded-lg">
      <AlertTriangle size={18} className="text-error shrink-0" strokeWidth={1.5} />
      <p className="flex-1 text-sm text-error">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-error border border-error/30 rounded-md hover:bg-error/5 cursor-pointer">
          <RefreshCw size={13} strokeWidth={1.5} /> Retry
        </button>
      )}
    </div>
  )
}
