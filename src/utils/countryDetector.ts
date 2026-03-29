import type { Article } from '@/types/article'
import { COUNTRIES, type CountryEntry } from '@/config/countries'

export interface CountryHit {
  country: CountryEntry
  count: number
  sources: Record<string, number>
  articles: Article[]
}

const termLookup: { term: string; country: CountryEntry }[] = []
for (const country of COUNTRIES) {
  for (const term of country.terms) {
    termLookup.push({ term: term.toLowerCase(), country })
  }
}

export function detectCountries(article: Article): CountryEntry[] {
  const text = `${article.title} ${article.desc}`.toLowerCase()
  const found = new Set<string>()
  const result: CountryEntry[] = []

  for (const { term, country } of termLookup) {
    if (found.has(country.code)) continue
    if (text.includes(term)) {
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
