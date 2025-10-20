export function fmtDateInput(dt?: string | null) {
  if (!dt) return ''
  const d = new Date(dt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateOrNull(v?: string) {
  return v ? new Date(v).toISOString() : null
}
