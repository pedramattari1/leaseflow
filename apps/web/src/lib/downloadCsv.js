const BASE = import.meta.env.VITE_API_URL || ''

export async function downloadCsv(path, filename) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
