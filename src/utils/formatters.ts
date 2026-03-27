export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function formatDate(str: string): string {
  if (!str) return ''
  try {
    const d = new Date(str)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function isToday(str: string): boolean {
  if (!str) return false
  try {
    const d = new Date(str)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  } catch {
    return false
  }
}

export function formatLastUpdated(isoString: string): string {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
