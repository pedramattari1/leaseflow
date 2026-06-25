import { useState, useEffect } from 'react'
import { Link2, Trash2, Copy, Check } from 'lucide-react'
import Modal from '../shared/Modal'
import { api } from '../../lib/api'

export default function ShareModal({ open, onClose }) {
  const [links, setLinks] = useState([])
  const [label, setLabel] = useState('')
  const [expiresIn, setExpiresIn] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (open) fetchLinks()
  }, [open])

  async function fetchLinks() {
    try {
      const data = await api.get('/api/share')
      setLinks(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function createLink() {
    setLoading(true)
    try {
      let expires_at = null
      if (expiresIn) {
        const d = new Date()
        d.setDate(d.getDate() + parseInt(expiresIn))
        expires_at = d.toISOString()
      }
      await api.post('/api/share', { label: label || 'Dashboard Link', expires_at })
      setLabel('')
      setExpiresIn('')
      fetchLinks()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function revokeLink(id) {
    try {
      await api.del(`/api/share/${id}`)
      setLinks((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  function copyUrl(token) {
    const url = `${window.location.origin}/d/${token}`
    navigator.clipboard.writeText(url)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Share Dashboard">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Link label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface"
          />
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface"
          >
            <option value="">No expiry</option>
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
          </select>
          <button
            onClick={createLink}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover cursor-pointer disabled:opacity-50"
          >
            Create
          </button>
        </div>

        {links.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">No share links yet</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg">
                <Link2 size={16} className="text-text-tertiary shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{link.label}</div>
                  <div className="text-xs text-text-tertiary">
                    {link.expires_at ? `Expires ${new Date(link.expires_at).toLocaleDateString()}` : 'Never expires'}
                  </div>
                </div>
                <button
                  onClick={() => copyUrl(link.token)}
                  className="p-1.5 rounded-md hover:bg-surface-active cursor-pointer"
                  title="Copy URL"
                >
                  {copied === link.token ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-text-tertiary" />}
                </button>
                <button
                  onClick={() => revokeLink(link.id)}
                  className="p-1.5 rounded-md hover:bg-error-bg cursor-pointer"
                  title="Revoke"
                >
                  <Trash2 size={16} className="text-error" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
