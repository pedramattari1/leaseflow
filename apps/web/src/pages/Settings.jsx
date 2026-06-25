import { useState, useEffect, useCallback } from 'react'
import { Link2, Bell, Trash2, Copy, Check } from 'lucide-react'
import { api } from '../lib/api'

const TABS = [
  { key: 'shares', label: 'Share Links', icon: Link2 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

export default function Settings() {
  const [tab, setTab] = useState('shares')

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary">Settings</h1>
      <p className="text-sm text-text-secondary mt-1">Share links and notification preferences.</p>

      <div className="flex gap-1 mt-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px cursor-pointer ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <t.icon size={16} strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'shares' && <ShareLinksTab />}
        {tab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  )
}

function ShareLinksTab() {
  const [links, setLinks] = useState([])
  const [label, setLabel] = useState('')
  const [expiresIn, setExpiresIn] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  const fetchLinks = useCallback(async () => {
    try {
      setLinks(await api.get('/api/share'))
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

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
    await api.del(`/api/share/${id}`)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  function copyUrl(token) {
    navigator.clipboard.writeText(`${window.location.origin}/d/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4 max-w-2xl">
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
          Create Link
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-sm text-text-tertiary py-4">No share links created yet.</p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
              <Link2 size={16} className="text-text-tertiary shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{link.label}</div>
                <div className="text-xs text-text-tertiary">
                  Created {new Date(link.created_at).toLocaleDateString()} · {link.expires_at ? `Expires ${new Date(link.expires_at).toLocaleDateString()}` : 'Never expires'}
                </div>
              </div>
              <button onClick={() => copyUrl(link.token)} className="p-1.5 rounded-md hover:bg-surface-hover cursor-pointer">
                {copied === link.token ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-text-tertiary" />}
              </button>
              <button onClick={() => revokeLink(link.id)} className="p-1.5 rounded-md hover:bg-error-bg cursor-pointer">
                <Trash2 size={16} className="text-error" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationsTab() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  useEffect(() => {
    api.get('/api/notifications/settings').then((s) => {
      setSettings(s)
      setEmailInput((s.recipient_emails || []).join(', '))
    }).catch(console.error)
  }, [])

  async function save() {
    setSaving(true)
    try {
      const recipient_emails = emailInput.split(',').map((e) => e.trim()).filter(Boolean)
      const updated = await api.put('/api/notifications/settings', { ...settings, recipient_emails })
      setSettings(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <p className="text-sm text-text-tertiary">Loading…</p>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-surface rounded-lg border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Daily Digest</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Send daily activity summary</span>
          <button
            onClick={() => setSettings((s) => ({ ...s, daily_digest_enabled: !s.daily_digest_enabled }))}
            className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-colors ${settings.daily_digest_enabled ? 'bg-primary' : 'bg-border'}`}
          >
            <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${settings.daily_digest_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {settings.daily_digest_enabled && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-text-secondary">Send at</label>
            <input
              type="time"
              value={settings.daily_digest_time || '18:00'}
              onChange={(e) => setSettings((s) => ({ ...s, daily_digest_time: e.target.value }))}
              className="px-3 py-1.5 border border-border rounded-lg text-sm bg-surface"
            />
          </div>
        )}
      </div>

      <div className="bg-surface rounded-lg border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Weekly Report</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Send weekly performance report</span>
          <button
            onClick={() => setSettings((s) => ({ ...s, weekly_report_enabled: !s.weekly_report_enabled }))}
            className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-colors ${settings.weekly_report_enabled ? 'bg-primary' : 'bg-border'}`}
          >
            <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${settings.weekly_report_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {settings.weekly_report_enabled && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-text-secondary">Send on</label>
            <select
              value={settings.weekly_report_day || 'monday'}
              onChange={(e) => setSettings((s) => ({ ...s, weekly_report_day: e.target.value }))}
              className="px-3 py-1.5 border border-border rounded-lg text-sm bg-surface"
            >
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-lg border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Pipeline Stall Alerts</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">Alert after</label>
          <input
            type="number"
            min={1}
            max={30}
            value={settings.pipeline_stall_days || 5}
            onChange={(e) => setSettings((s) => ({ ...s, pipeline_stall_days: parseInt(e.target.value) || 5 }))}
            className="w-16 px-3 py-1.5 border border-border rounded-lg text-sm bg-surface text-center"
          />
          <span className="text-sm text-text-secondary">days in same stage</span>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Recipients</h3>
        <div>
          <label className="text-sm text-text-secondary block mb-1">Email addresses (comma-separated)</label>
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="manager@example.com, team@example.com"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover cursor-pointer disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}

