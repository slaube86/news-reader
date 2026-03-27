import type { Article } from '@/types/article'
import type { FeedConfig } from '@/types/feed'
import { PROXY_PRIMARY, PROXY_FALLBACK } from '@/config/constants'
import { parseRssFeed } from '@/utils/xmlParser'

export async function fetchWithRetries(
  url: string,
  options: RequestInit = {},
  attempts: number = 2,
  timeoutMs: number = 15000,
): Promise<Response> {
  let lastErr: Error | undefined
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timer)
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '0', 10)
        const wait = retryAfter > 0 ? retryAfter * 1000 : Math.pow(3, i + 1) * 1000
        await new Promise((r) => setTimeout(r, wait))
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } catch (err) {
      lastErr = err as Error
      const delay = Math.pow(3, i) * 1000
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastErr
}

export async function fetchFeed(feed: FeedConfig): Promise<Article[]> {
  let res: Response
  let usedFallback = false

  try {
    res = await fetchWithRetries(PROXY_PRIMARY + encodeURIComponent(feed.url), {}, 2, 15000)
  } catch {
    usedFallback = true
    res = await fetchWithRetries(PROXY_FALLBACK + encodeURIComponent(feed.url), {}, 2, 20000)
  }

  let xmlString = await res.text()

  if (usedFallback) {
    const dataUriMatch = xmlString.match(/^data:.*;base64,(.+)$/s)
    if (dataUriMatch) {
      try {
        xmlString = atob(dataUriMatch[1])
      } catch {
        throw new Error('Base64-Decoding fehlgeschlagen')
      }
    }
  }

  return parseRssFeed(xmlString, feed)
}
