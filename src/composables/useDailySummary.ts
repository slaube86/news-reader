import { computed } from 'vue'
import { useArticlesStore } from '@/stores/articles'
import { buildCountryStats, type CountryHit } from '@/utils/countryDetector'
import { STOPWORDS } from '@/config/constants'
import { useI18n } from '@/composables/useI18n'
import type { Article } from '@/types/article'

export interface SourceRank {
  source: string
  name: string
  count: number
}

export interface KeywordHit {
  word: string
  count: number
}

export interface TimeSlot {
  label: string
  count: number
}

const TIME_SLOTS = [
  { key: 'time.night' as const, from: 0, to: 6 },
  { key: 'time.morning' as const, from: 6, to: 12 },
  { key: 'time.noon' as const, from: 12, to: 18 },
  { key: 'time.evening' as const, from: 18, to: 24 },
] as const

export function useDailySummary() {
  const articlesStore = useArticlesStore()
  const { t } = useI18n()

  const todayArticles = computed<Article[]>(() => {
    const now = new Date()
    return articlesStore.allItems.filter((i) => {
      const d = new Date(i.date)
      return d.toDateString() === now.toDateString()
    })
  })

  const sourceRanking = computed<SourceRank[]>(() => {
    const map = new Map<string, SourceRank>()
    for (const item of todayArticles.value) {
      let entry = map.get(item.source)
      if (!entry) {
        entry = { source: item.source, name: item.sourceName, count: 0 }
        map.set(item.source, entry)
      }
      entry.count++
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  })

  const countryStats = computed<CountryHit[]>(() => {
    return buildCountryStats(todayArticles.value).slice(0, 5)
  })

  const trendingKeywords = computed<KeywordHit[]>(() => {
    const freq = new Map<string, number>()
    for (const item of todayArticles.value) {
      const words = item.title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w))

      for (const word of words) {
        freq.set(word, (freq.get(word) || 0) + 1)
      }
    }
    return Array.from(freq.entries())
      .map(([word, count]) => ({ word, count }))
      .filter((k) => k.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  })

  const timeDistribution = computed<TimeSlot[]>(() => {
    const slots = TIME_SLOTS.map((s) => ({ label: t(s.key), count: 0 }))
    for (const item of todayArticles.value) {
      const hour = new Date(item.date).getHours()
      const idx = TIME_SLOTS.findIndex((s) => hour >= s.from && hour < s.to)
      if (idx >= 0) slots[idx].count++
    }
    return slots
  })

  const totalCount = computed(() => todayArticles.value.length)
  const sourceCount = computed(() => sourceRanking.value.length)

  return {
    todayArticles,
    sourceRanking,
    countryStats,
    trendingKeywords,
    timeDistribution,
    totalCount,
    sourceCount,
  }
}
