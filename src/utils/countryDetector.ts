import type { Article } from '@/types/article'
import { COUNTRIES, type CountryEntry } from '@/config/countries'

export interface CountryHit {
  country: CountryEntry
  count: number
  sources: Record<string, number>
  articles: Article[]
}

const isLatin = /^[a-z0-9\s\-äöüß]+$/

const termLookup: { regex: RegExp; country: CountryEntry }[] = []
for (const country of COUNTRIES) {
  for (const term of country.terms) {
    const lower = term.toLowerCase()
    const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = isLatin.test(lower)
      ? new RegExp(`\\b${escaped}\\b`, 'i')
      : new RegExp(`(?<=^|[\\s.,،؛:!؟\\-«»"'()\\[\\]])${escaped}(?=$|[\\s.,،؛:!؟\\-«»"'()\\[\\]])`, 'i')
    termLookup.push({ regex, country })
  }
}

export function detectCountries(article: Article): CountryEntry[] {
  const text = `${article.title} ${article.desc}`
  const found = new Set<string>()
  const result: CountryEntry[] = []

  for (const { regex, country } of termLookup) {
    if (found.has(country.code)) continue
    if (regex.test(text)) {
      found.add(country.code)
      result.push(country)
    }
  }

  return result
}

export function buildCountryStats(articles: Article[]): CountryHit[] {
  const map = new Map<string, CountryHit>()

  for (const article of articles) {
    const countries = detectCountries(article)
    for (const country of countries) {
      let hit = map.get(country.code)
      if (!hit) {
        hit = { country, count: 0, sources: {}, articles: [] }
        map.set(country.code, hit)
      }
      hit.count++
      hit.sources[article.sourceName] = (hit.sources[article.sourceName] || 0) + 1
      hit.articles.push(article)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

export function highlightTerms(text: string, terms: string[]): string {
  if (!terms.length || !text) return escapeHtml(text)

  const patterns = terms.map((t) => {
    const lower = t.toLowerCase()
    const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return isLatin.test(lower)
      ? `\\b${escaped}\\b`
      : `(?<=^|[\\s.,،؛:!؟\\-«»"'()\\[\\]])${escaped}(?=$|[\\s.,،؛:!؟\\-«»"'()\\[\\]])`
  })

  const combined = new RegExp(`(${patterns.join('|')})`, 'gi')
  const safe = escapeHtml(text)
  return safe.replace(combined, '<mark class="term-hit">$1</mark>')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
