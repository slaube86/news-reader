import type { Article } from '@/types/article'
import type { FeedConfig } from '@/types/feed'
import { PROXY_PRIMARY, PROXY_FALLBACK, AGGREGATOR_URL } from '@/config/constants'
import { parseRssFeed } from '@/utils/xmlParser'

// ── ETag-Cache für conditional requests ──
const etagCache = new Map<string, { etag: string; lastModified: string; data: Article[] }>()

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).then(
    (res) => { clearTimeout(timer); return res },
    (err) => { clearTimeout(timer); throw err },
  )
}

/**
 * Parallel Proxy Fetching: Beide Proxies gleichzeitig anfragen,
 * der schnellere gewinnt (Promise.any).
 */
async function fetchViaProxies(feedUrl: string, headers: Record<string, string> = {}): Promise<{ res: Response; usedFallback: boolean }> {
  const primaryUrl = PROXY_PRIMARY + encodeURIComponent(feedUrl)
  const fallbackUrl = PROXY_FALLBACK + encodeURIComponent(feedUrl)

  const primaryFetch = fetchWithTimeout(primaryUrl, { headers }, 15000)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return { res, usedFallback: false }
    })

  const fallbackFetch = fetchWithTimeout(fallbackUrl, {}, 20000)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return { res, usedFallback: true }
    })

  return Promise.any([primaryFetch, fallbackFetch])
}

function decodeBase64Response(xmlString: string): string {
  const dataUriMatch = xmlString.match(/^data:.*;base64,(.+)$/s)
  if (dataUriMatch) {
    try {
      return atob(dataUriMatch[1])
    } catch {
      throw new Error('Base64-Decoding fehlgeschlagen')
    }
  }
  return xmlString
}

/**
 * Versucht alle Feeds über den Aggregator-Endpoint zu laden (1 Request statt 15).
 * Gibt null zurück wenn der Aggregator nicht erreichbar ist.
 */
export async function fetchAllFromAggregator(): Promise<Record<string, Article[]> | null> {
  try {
    const res = await fetchWithTimeout(AGGREGATOR_URL, {}, 30000)
    if (!res.ok) return null
    const data = await res.json() as { feeds: Record<string, { articles: Article[]; error?: string }> }
    const result: Record<string, Article[]> = {}
    for (const [feedId, feedData] of Object.entries(data.feeds)) {
      result[feedId] = feedData.articles || []
    }
    return result
  } catch {
    return null
  }
}

export async function fetchFeed(feed: FeedConfig): Promise<Article[]> {
  // ETag/Last-Modified conditional headers
  const cached = etagCache.get(feed.id)
  const condHeaders: Record<string, string> = {}
  if (cached?.etag) condHeaders['If-None-Match'] = cached.etag
  if (cached?.lastModified) condHeaders['If-Modified-Since'] = cached.lastModified

  const { res, usedFallback } = await fetchViaProxies(feed.url, condHeaders)

  // 304 Not Modified → Cache verwenden
  if (res.status === 304 && cached) {
    return cached.data
  }

  let xmlString = await res.text()

  if (usedFallback) {
    xmlString = decodeBase64Response(xmlString)
  }

  const articles = parseRssFeed(xmlString, feed)

  // ETag/Last-Modified für nächsten Request speichern
  const etag = res.headers.get('ETag') || ''
  const lastModified = res.headers.get('Last-Modified') || ''
  if (etag || lastModified) {
    etagCache.set(feed.id, { etag, lastModified, data: articles })
  }

  return articles
}
