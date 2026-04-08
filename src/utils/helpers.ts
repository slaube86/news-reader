import { IRAN_TERMS_HIGH, IRAN_TERMS_MEDIUM, IRAN_TERMS_LOW } from '@/config/iranTerms'

export function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function isIranRelated(text: string): boolean {
  const t = text.toLowerCase()
  const high = IRAN_TERMS_HIGH.some(term => t.includes(term))
  if (high) return true
  const mediumCount = IRAN_TERMS_MEDIUM.filter(term => t.includes(term)).length
  if (mediumCount >= 2) return true
  const lowCount = IRAN_TERMS_LOW.filter(term => t.includes(term)).length
  if (mediumCount >= 1 && lowCount >= 1) return true
  return false
}

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
  '&ndash;': '–', '&mdash;': '—', '&laquo;': '«', '&raquo;': '»',
  '&nbsp;': ' ', '&copy;': '©', '&reg;': '®', '&trade;': '™',
  '&hellip;': '…', '&bull;': '•', '&middot;': '·',
  '&lsquo;': '\u2018', '&rsquo;': '\u2019', '&ldquo;': '\u201C', '&rdquo;': '\u201D',
}

export function decodeEntities(str: string): string {
  if (!str) return str
  return str.replace(
    /&(?:#(\d+)|#x([0-9a-fA-F]+)|[a-zA-Z]+);/g,
    (entity, dec, hex) => {
      if (dec) return String.fromCodePoint(Number(dec))
      if (hex) return String.fromCodePoint(parseInt(hex, 16))
      return HTML_ENTITIES[entity] || entity
    },
  )
}
