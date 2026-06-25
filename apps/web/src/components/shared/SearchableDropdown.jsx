import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function SearchableDropdown({ label, options, value, onChange, displayKey = 'label', valueKey = 'value', placeholder = 'Search...' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find((o) => o[valueKey] === value)
  const filtered = options.filter((o) =>
    o[displayKey].toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery('') }}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm text-left hover:border-text-tertiary transition-colors cursor-pointer"
      >
        <span className={selected ? 'text-text-primary' : 'text-text-tertiary'}>
          {selected ? selected[displayKey] : placeholder}
        </span>
        <ChevronDown size={16} className="text-text-tertiary shrink-0" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-md shadow-md max-h-60 overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-text-tertiary">No results</li>
            )}
            {filtered.map((option) => (
              <li
                key={option[valueKey]}
                onClick={() => { onChange(option); setOpen(false) }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-surface-hover ${
                  option[valueKey] === value ? 'bg-primary-light text-primary font-medium' : 'text-text-primary'
                }`}
              >
                {option[displayKey]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
