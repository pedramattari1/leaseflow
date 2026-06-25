import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import { Upload } from 'lucide-react'

export default function CSVImport({ onImport, onCancel }) {
  const [data, setData] = useState(null)
  const [headers, setHeaders] = useState([])
  const [mapping, setMapping] = useState({})
  const [importing, setImporting] = useState(false)

  const fields = [
    { key: 'unit_number', label: 'Unit Number', required: true },
    { key: 'unit_type', label: 'Unit Type', required: true },
    { key: 'floor', label: 'Floor' },
    { key: 'market_rent', label: 'Market Rent' },
    { key: 'sqft', label: 'Sqft' },
    { key: 'status', label: 'Status' },
  ]

  const handleFile = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data)
        setHeaders(result.meta.fields || [])
        const autoMap = {}
        for (const f of fields) {
          const match = result.meta.fields?.find((h) =>
            h.toLowerCase().replace(/[^a-z]/g, '').includes(f.key.replace(/_/g, ''))
          )
          if (match) autoMap[f.key] = match
        }
        setMapping(autoMap)
      },
    })
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    if (!data) return
    setImporting(true)
    try {
      const units = data.map((row) => {
        const unit = {}
        for (const f of fields) {
          if (mapping[f.key]) unit[f.key] = row[mapping[f.key]]
        }
        return unit
      }).filter((u) => u.unit_number && u.unit_type)
      await onImport(units)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      {!data ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors"
        >
          <Upload size={32} className="mx-auto text-text-tertiary mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-secondary mb-2">Drag & drop a CSV file here, or</p>
          <label className="inline-block px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary-light cursor-pointer">
            Browse Files
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">{data.length} rows found. Map columns:</p>
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.key} className="flex items-center gap-3">
                <span className="text-sm font-medium w-28 shrink-0">{f.label}{f.required ? ' *' : ''}</span>
                <select
                  value={mapping[f.key] || ''}
                  onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md"
                >
                  <option value="">— skip —</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="bg-surface-hover rounded-md p-3 max-h-40 overflow-auto">
            <p className="text-xs font-medium text-text-secondary mb-2">Preview (first 3 rows):</p>
            <table className="w-full text-xs">
              <thead>
                <tr>{headers.map((h) => <th key={h} className="text-left pr-3 pb-1 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.slice(0, 3).map((row, i) => (
                  <tr key={i}>{headers.map((h) => <td key={h} className="pr-3 py-0.5 text-text-secondary">{row[h]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
              Cancel
            </button>
            <button onClick={handleImport} disabled={importing || !mapping.unit_number || !mapping.unit_type}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 cursor-pointer">
              {importing ? 'Importing...' : `Import ${data.length} Units`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
