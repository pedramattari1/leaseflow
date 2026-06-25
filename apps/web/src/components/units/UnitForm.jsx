import { useState, useEffect } from 'react'

const UNIT_TYPES = [
  'Studio A', 'Studio B',
  '1bd 1ba A', '1bd 1ba B', '1bd 1ba C', '1bd 1ba D',
  '2bd 2ba A', '2bd 2ba B', '2bd 2ba C', '2bd 2ba D', '2bd 2ba E', '2bd 2ba F',
]
const STATUSES = ['available', 'occupied', 'notice', 'down']

export default function UnitForm({ unit, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    unit_number: '', unit_type: 'Studio', floor: '', market_rent: '', sqft: '', status: 'available',
  })

  useEffect(() => {
    if (unit) {
      setForm({
        unit_number: unit.unit_number || '',
        unit_type: unit.unit_type || 'Studio',
        floor: unit.floor || '',
        market_rent: unit.market_rent || '',
        sqft: unit.sqft || '',
        status: unit.status || 'available',
      })
    }
  }, [unit])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Unit Number *</label>
        <input type="text" required value={form.unit_number} onChange={set('unit_number')}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Unit Type *</label>
        <select required value={form.unit_type} onChange={set('unit_type')}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Floor</label>
          <input type="number" value={form.floor} onChange={set('floor')}
            className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Sqft</label>
          <input type="number" value={form.sqft} onChange={set('sqft')}
            className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Market Rent</label>
        <input type="number" step="0.01" value={form.market_rent} onChange={set('market_rent')}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
        <select value={form.status} onChange={set('status')}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
          Cancel
        </button>
        <button type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover cursor-pointer">
          {unit ? 'Update' : 'Add Unit'}
        </button>
      </div>
    </form>
  )
}
