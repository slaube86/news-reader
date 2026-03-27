import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FEEDS } from '@/config/feeds'
import { BATCH_SIZE } from '@/config/constants'
import { fetchFeed } from '@/composables/useFeedFetcher'
import { getSavedArticlesFromDB } from '@/composables/useIndexedDB'
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'
import type { FeedConfig } from '@/types/feed'

export interface FeedError {
  message: string
  type: 'error' | 'info'
}

export const useFeedsStore = defineStore('feeds', () => {
  const feeds = ref<FeedConfig[]>(FEEDS)
  const lastRefreshTimes = ref<Record<string, string>>({})
  const feedErrors = ref<Record<string, FeedError>>({})

  function setFeedError(src: string, message: string, type: 'error' | 'info' = 'error') {
    feedErrors.value[src] = { message, type }
  }

  function clearFeedError(src: string) {
    delete feedErrors.value[src]
  }

  function clearAllFeedErrors() {
    feedErrors.value = {}
  }

  async function refreshSource(src: string): Promise<void> {
    const feed = feeds.value.find((f) => f.id === src)
    if (!feed) return

    const articles = useArticlesStore()
    const ui = useUiStore()

    ui.showLoadingToast(`Aktualisiere ${feed.name}`)
    ui.isLoadingFeeds = true

    try {
      const items = await fetchFeed(feed)
      if (items.length > 0) {
        const filtered = articles.allItems.filter((i) => i.source !== src)
        articles.setItems(articles.mergeArticles(filtered, items))
      }
      lastRefreshTimes.value[src] = new Date().toISOString()
      clearFeedError(src)

      if (items.length === 0) {
        setFeedError(src, 'Keine passenden Iran-Artikel gefunden', 'info')
        ui.showErrorToast(`${feed.name}: Keine passenden Iran-Artikel gefunden`, 4500)
      } else {
        ui.showToast(`${feed.name} aktualisiert (${items.length} Artikel)`)
      }

      await articles.saveAndPrune()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setFeedError(src, msg, 'error')
      ui.showErrorToast(`${feed.name}: ${msg}`)
    } finally {
      ui.isLoadingFeeds = false
      ui.hideLoadingToast()
    }
  }

  async function fetchAllFeeds(): Promise<void> {
    const articles = useArticlesStore()
    const ui = useUiStore()

    ui.isLoadingFeeds = true
    ui.showLoadingToast('Feeds werden geladen')

    const results: PromiseSettledResult<Awaited<ReturnType<typeof fetchFeed>>>[] = []
    for (let i = 0; i < feeds.value.length; i += BATCH_SIZE) {
      const batch = feeds.value.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.allSettled(batch.map(fetchFeed))
      results.push(...batchResults)
      if (i + BATCH_SIZE < feeds.value.length) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    const errors: string[] = []
    clearAllFeedErrors()

    const fetchedItems = results.flatMap((r, i) => {
      if (r.status === 'fulfilled') {
        clearFeedError(feeds.value[i].id)
        lastRefreshTimes.value[feeds.value[i].id] = new Date().toISOString()
        return r.value
      }
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason)
      setFeedError(feeds.value[i].id, msg, 'error')
      errors.push(`${feeds.value[i].name}: ${msg}`)
      return []
    })

    if (errors.length) {
      ui.showErrorToast(
        `Konnte nicht laden: ${errors.join(', ')}. CORS-Proxy kann zeitweise überlastet sein.`,
        5000,
      )
    }

    if (!fetchedItems.length && errors.length === feeds.value.length) {
      const savedItems = await getSavedArticlesFromDB().catch(() => [])
      if (savedItems.length) {
        articles.setItems(savedItems)
        await articles.syncSavedArticleIds()
        ui.showToast('Offline-Modus: Artikel aus IndexedDB geladen')
      } else {
        ui.showErrorToast('Keine Verbindung zu den Feeds', 5000)
      }
    } else {
      const savedItems = await getSavedArticlesFromDB().catch(() => [])
      articles.setItems(articles.mergeArticles(savedItems, fetchedItems))
      ui.showToast('Alle Quellen wurden aktualisiert')
      await articles.saveAndPrune()
    }

    ui.isLoadingFeeds = false
    ui.hideLoadingToast()
  }

  return {
    feeds,
    lastRefreshTimes,
    feedErrors,
    setFeedError,
    clearFeedError,
    clearAllFeedErrors,
    refreshSource,
    fetchAllFeeds,
  }
})
