import { useState, useEffect, useRef } from 'react'
import { Search, User, X } from 'lucide-react'
import { api } from '../../lib/api'

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.get(`/api/prospects?search=${encodeURIComponent(query)}`)
        setResults(data)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [query])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search size={18} className="text-text-tertiary shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prospects…"
            className="flex-1 py-3.5 text-sm bg-transparent focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary bg-surface-hover rounded border border-border">
            ESC
          </kbd>
        </div>
        {query.trim() && (
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-sm text-text-tertiary">Searching…</div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-sm text-text-tertiary">No prospects found.</div>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover cursor-pointer text-left"
                >
                  <User size={16} className="text-text-tertiary shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{p.name}</div>
                    <div className="text-xs text-text-tertiary truncate">
                      {[p.email, p.phone].filter(Boolean).join(' · ') || 'No contact info'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
