import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article } from '@/types/article'
import { FEEDS } from '@/config/feeds'
import { PRUNE_DAYS } from '@/config/constants'
import { isToday } from '@/utils/formatters'
import {
  getSavedArticlesFromDB,
  saveArticlesToDB,
  removeOldArticlesFromDB,
} from '@/composables/useIndexedDB'

export const useArticlesStore = defineStore('articles', () => {
  const allItems = ref<Article[]>([])
  const savedArticleIds = ref<Set<string>>(new Set())
  const currentSource = ref('today')
  const searchKeyword = ref('')
  const sortMode = ref<'date' | 'source'>('date')

  const filteredItems = computed(() => {
    let items: Article[]
    if (currentSource.value === 'all') {
      items = allItems.value.filter((i) => i.date && !isNaN(new Date(i.date).getTime()))
    } else if (currentSource.value === 'today') {
      const now = new Date()
      items = allItems.value.filter((i) => {
        const d = new Date(i.date)
        return d.toDateString() === now.toDateString()
      })
    } else {
      items = allItems.value.filter((i) => i.source === currentSource.value)
    }

    const kw = searchKeyword.value.toLowerCase().trim()
    if (kw) {
      items = items.filter((i) =>
        (i.title + ' ' + i.desc).toLowerCase().includes(kw),
      )
    }

    if (sortMode.value === 'date') {
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      items.sort(
        (a, b) =>
          a.sourceName.localeCompare(b.sourceName) ||
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
    }
    return items
  })

  const todayCount = computed(() => {
    return allItems.value.filter((i) => isToday(i.date)).length
  })

  const sourceCounts = computed(() => {
    const counts: Record<string, number> = {}
    FEEDS.forEach((f) => (counts[f.id] = 0))
    allItems.value.forEach((it) => {
      if (counts[it.source] !== undefined) counts[it.source]++
    })
    return counts
  })

  function mergeArticles(baseItems: Article[], newItems: Article[]): Article[] {
    const map = new Map<string, Article>()
    baseItems.forEach((item) => map.set(item.id, item))
    newItems.forEach((item) => map.set(item.id, item))
    const merged = Array.from(map.values())
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return merged
  }

  async function loadFromDB(): Promise<void> {
    try {
      const items = await getSavedArticlesFromDB()
      savedArticleIds.value = new Set(items.map((i) => i.id))
      if (items.length) {
        allItems.value = items
      }
    } catch (e) {
      console.error('IndexedDB: loadFromDB fehlgeschlagen:', e)
      savedArticleIds.value = new Set()
    }
  }

  async function syncSavedArticleIds(): Promise<void> {
    try {
      const items = await getSavedArticlesFromDB()
      savedArticleIds.value = new Set(items.map((i) => i.id))
    } catch (e) {
      console.error('IndexedDB: syncSavedArticleIds fehlgeschlagen:', e)
      savedArticleIds.value = new Set()
    }
  }

  async function saveAndPrune(): Promise<void> {
    try {
      await saveArticlesToDB(allItems.value)
      // Prune in memory
      const threshold = Date.now() - PRUNE_DAYS * 24 * 60 * 60 * 1000
      allItems.value = allItems.value.filter((item) => {
        const d = new Date(item.date)
        return isNaN(d.getTime()) || d.getTime() >= threshold
      })
      await removeOldArticlesFromDB(PRUNE_DAYS)
      await syncSavedArticleIds()
    } catch (e) {
      console.error('IndexedDB Fehler:', e)
    }
  }

  function setItems(items: Article[]) {
    allItems.value = items
  }

  function setCurrentSource(source: string) {
    currentSource.value = source
  }

  return {
    allItems,
    savedArticleIds,
    currentSource,
    searchKeyword,
    sortMode,
    filteredItems,
    todayCount,
    sourceCounts,
    mergeArticles,
    loadFromDB,
    syncSavedArticleIds,
    saveAndPrune,
    setItems,
    setCurrentSource,
  }
})
