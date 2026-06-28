import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, Trash2 } from 'lucide-react'
import Modal from '../shared/Modal'

const UNIT_TYPES = [
  'Studio A', 'Studio B',
  '1bd 1ba A', '1bd 1ba B', '1bd 1ba C', '1bd 1ba D',
  '2bd 2ba A', '2bd 2ba B', '2bd 2ba C', '2bd 2ba D', '2bd 2ba E', '2bd 2ba F',
]
const SOURCES = ['Walk-in', 'Website', 'Zillow', 'Apartments.com', 'Referral', 'Social Media', 'Other']
const STATUSES = ['hot', 'warm', 'cold', 'applied', 'not_interested']
const CONCESSION_OPTIONS = [0, 2, 4, 6, 8]
const MIN_TERM = { 0: 0, 2: 12, 4: 12, 6: 13, 8: 14 }

function calcConcessionTotal(marketRent, weeks) {
  if (!marketRent || !weeks) return 0
  return (marketRent * 12) / 52 * weeks
}

function calcNetEffective(marketRent, concessionTotal, leaseTerm) {
  if (!marketRent || !leaseTerm) return ''
  return marketRent - (concessionTotal / leaseTerm)
}

export default function TourForm({ tour, rentFloors, onSubmit, onCancel, onDelete, onCreateApplication }) {
  const [expanded, setExpanded] = useState(!!tour)
  const [showApplyPrompt, setShowApplyPrompt] = useState(false)
  const [savedTour, setSavedTour] = useState(null)
  const [form, setForm] = useState({
    prospect_name: '', prospect_email: '', prospect_phone: '',
    unit_type: '', unit_number: '', market_rent: '',
    concession_weeks: '0', desired_term: '',
    budget: '', variance: '',
    comps_toured: '0', estimated_move_in: '',
    profession: '', num_vehicles: '0', source: '', status: 'warm', notes: '',
  })

  useEffect(() => {
    if (tour) {
      setForm({
        prospect_name: tour.prospect_name || '',
        prospect_email: tour.prospect_email || '',
        prospect_phone: tour.prospect_phone || '',
        unit_type: tour.unit_type || '',
        unit_number: tour.unit_number || '',
        market_rent: tour.market_rent || '',
        concession_weeks: String(tour.concession_weeks || 0),
        desired_term: tour.desired_term || '',
        budget: tour.budget || '',
        variance: tour.variance || '',
        comps_toured: tour.comps_toured || '0',
        estimated_move_in: tour.estimated_move_in?.split('T')[0] || '',
        profession: tour.profession || '',
        num_vehicles: tour.num_vehicles || '0',
        source: tour.source || '',
        status: tour.status || 'warm',
        notes: tour.notes || '',
      })
    }
  }, [tour])

  // Computed concession values
  const mr = Number(form.market_rent) || 0
  const weeks = Number(form.concession_weeks) || 0
  const leaseTerm = Number(form.desired_term) || 0
  const concessionTotal = calcConcessionTotal(mr, weeks)
  const netEffective = leaseTerm > 0 ? calcNetEffective(mr, concessionTotal, leaseTerm) : ''

  // Rent floor lookup — use unit_type as the key since it matches unit_code now
  const rentFloor = useMemo(() => {
    if (!form.unit_type || !rentFloors?.length) return null
    return rentFloors.find(f => f.unit_code === form.unit_type)
  }, [form.unit_type, rentFloors])

  // Warnings
  const termWarning = weeks > 0 && leaseTerm > 0 && leaseTerm < MIN_TERM[weeks]
    ? `Minimum lease term for ${weeks}-week concession is ${MIN_TERM[weeks]} months.`
    : null

  // Lender floor applies to gross market rent (pre-concession), not net effective.
  const floorWarning = rentFloor && mr > 0 && mr < Number(rentFloor.min_gross_rent)
    ? `Market rent is below minimum gross rent of $${Number(rentFloor.min_gross_rent).toLocaleString()} for ${form.unit_type} per lender agreement.`
    : null

  // Variance computed from net effective
  const computedVariance = netEffective !== '' && form.budget
    ? Number(netEffective) - Number(form.budget)
    : (mr && form.budget ? mr - Number(form.budget) : '')

  const set = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault()
    const payload = {
      ...form,
      concession: concessionTotal,
      concession_weeks: weeks,
      effective_rent: netEffective !== '' ? Number(netEffective).toFixed(2) : null,
      variance: computedVariance !== '' ? computedVariance : null,
    }
    const result = await onSubmit(payload, !!tour)
    if (form.status === 'applied' && onCreateApplication && (!tour || tour.status !== 'applied')) {
      setSavedTour(result || { ...tour, ...payload })
      setShowApplyPrompt(true)
    } else if (addAnother) {
      setForm({
        ...form, prospect_name: '', prospect_email: '', prospect_phone: '',
        unit_type: '', unit_number: '', market_rent: '',
        concession_weeks: '0', desired_term: '',
        budget: '', variance: '',
        comps_toured: '0', estimated_move_in: '',
        profession: '', num_vehicles: '0', notes: '',
      })
    }
  }

  const handleCreateApp = () => {
    if (savedTour && onCreateApplication) {
      onCreateApplication(savedTour)
    }
    setShowApplyPrompt(false)
    setSavedTour(null)
  }

  const inputClass = 'w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Name *</label>
          <input type="text" required value={form.prospect_name} onChange={set('prospect_name')} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Unit Type</label>
            <select value={form.unit_type} onChange={set('unit_type')} className={inputClass}>
              <option value="">Select...</option>
              {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Unit Number</label>
            <input type="text" value={form.unit_number} onChange={set('unit_number')} placeholder="e.g. 301" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Market Rent</label>
            <input type="number" step="0.01" value={form.market_rent} onChange={set('market_rent')} placeholder="e.g. 3450" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Source</label>
            <select value={form.source} onChange={set('source')} className={inputClass}>
              <option value="">Select...</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Concession Calculator — always visible */}
        <div className="bg-primary-light rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-primary">Concession Calculator</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Concession (weeks)</label>
              <select value={form.concession_weeks} onChange={set('concession_weeks')} className={inputClass}>
                {CONCESSION_OPTIONS.map(w => (
                  <option key={w} value={w}>{w === 0 ? 'None' : `${w} weeks`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Lease Term (months)</label>
              <input
                type="number"
                min={1}
                value={form.desired_term}
                onChange={set('desired_term')}
                placeholder="e.g. 12"
                className={inputClass}
              />
            </div>
          </div>

          {(weeks > 0 || netEffective !== '') && (
            <div className="space-y-1.5 pt-1">
              {weeks > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-text-secondary">Total Concession:</span>
                  <span className="text-sm font-semibold tabular-nums">${concessionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {weeks > 0 && leaseTerm > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-text-secondary">Monthly Deduction:</span>
                  <span className="text-sm font-semibold tabular-nums">${(concessionTotal / leaseTerm).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</span>
                </div>
              )}
              {netEffective !== '' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-text-secondary">Net Effective:</span>
                  <span className={`text-sm font-semibold tabular-nums ${floorWarning ? 'text-error' : 'text-success'}`}>
                    ${Number(netEffective).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                  </span>
                </div>
              )}
            </div>
          )}

          {termWarning && (
            <div className="flex items-center gap-2 px-3 py-2 bg-warning-bg rounded-md">
              <AlertTriangle size={14} className="text-warning shrink-0" />
              <span className="text-xs text-warning font-medium">{termWarning}</span>
            </div>
          )}

          {floorWarning && (
            <div className="flex items-center gap-2 px-3 py-2 bg-error-bg rounded-md">
              <AlertTriangle size={14} className="text-error shrink-0" />
              <span className="text-xs text-error font-medium">{floorWarning}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
          <select value={form.status} onChange={set('status')} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'not_interested' ? 'Not Interested' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2}
            className={`${inputClass} resize-y min-h-[80px]`} />
        </div>

        <button type="button" onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-medium text-primary cursor-pointer hover:underline">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Hide' : 'Show'} All Fields
        </button>

        {expanded && (
          <div className="space-y-5 pt-2 border-t border-border-subtle">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <input type="email" value={form.prospect_email} onChange={set('prospect_email')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
                <input type="tel" value={form.prospect_phone} onChange={set('prospect_phone')} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Budget</label>
                <input type="number" step="0.01" value={form.budget} onChange={set('budget')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Variance</label>
                <input type="number" step="0.01" value={computedVariance} readOnly className={`${inputClass} bg-surface-hover`} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Comps Toured</label>
                <input type="number" min="0" step="1" value={form.comps_toured} onChange={set('comps_toured')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Est. Move-in</label>
                <input type="date" value={form.estimated_move_in} onChange={set('estimated_move_in')} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Profession</label>
                <input type="text" value={form.profession} onChange={set('profession')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Vehicles</label>
                <input type="number" min="0" step="1" value={form.num_vehicles} onChange={set('num_vehicles')} className={`${inputClass} max-w-[120px]`} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          {tour && onDelete && (
            <button type="button" onClick={() => onDelete(tour)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-error border border-error/30 rounded-md hover:bg-error-bg cursor-pointer sm:mr-auto">
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
            Cancel
          </button>
          {!tour && (
            <button type="button" onClick={(e) => handleSubmit(e, true)}
              className="px-5 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
              Save & Add Another
            </button>
          )}
          <button type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover cursor-pointer">
            {tour ? 'Update' : 'Save Tour'}
          </button>
        </div>
      </form>

      <Modal open={showApplyPrompt} onClose={() => setShowApplyPrompt(false)} title="Create Application?"
        footer={
          <>
            <button onClick={() => setShowApplyPrompt(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface-hover cursor-pointer">
              Skip
            </button>
            <button onClick={handleCreateApp}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover cursor-pointer">
              Create Application
            </button>
          </>
        }>
        <p className="text-sm text-text-secondary">
          This prospect's status is "Applied". Would you like to create an application in the pipeline?
        </p>
      </Modal>
    </>
  )
}
