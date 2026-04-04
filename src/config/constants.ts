export const PROXY_PRIMARY = 'https://rss-cors-proxy.sebastian-laube.workers.dev/?url=' as const
export const PROXY_FALLBACK = 'https://api.allorigins.win/raw?url=' as const
export const TRANSLATE_URL = 'https://rss-cors-proxy.sebastian-laube.workers.dev/translate' as const
export const AGGREGATOR_URL = 'https://rss-cors-proxy.sebastian-laube.workers.dev/feeds/all' as const

export const DB_NAME = 'IranNewsReaderDB' as const
export const DB_VERSION = 3
export const STORE_NAME = 'savedArticles' as const
export const DEXIE_DB_NAME = 'IranNewsReaderDexie' as const

export const BATCH_SIZE = 4
export const REFRESH_INTERVAL = 15 * 60 * 1000 // 15 Minuten in ms
export const REFRESH_SECONDS = 900 // 15 Minuten in Sekunden
export const PRUNE_DAYS = 60
export const PAGE_SIZE = 50

export const STOPWORDS: Set<string> = new Set([
  // Deutsch
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'einem', 'einen',
  'und', 'oder', 'aber', 'als', 'auch', 'auf', 'aus', 'bei', 'bis', 'für', 'mit',
  'nach', 'von', 'vor', 'zu', 'zum', 'zur', 'über', 'unter', 'durch', 'gegen',
  'nicht', 'noch', 'nur', 'sich', 'wie', 'wird', 'hat', 'ist', 'sind', 'war',
  'mehr', 'neue', 'neuer', 'neues', 'neuem', 'neuen', 'will', 'soll', 'kann',
  'im', 'in', 'es', 'so', 'um', 'am', 'an', 'ob', 'ab',
  // Englisch
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'not', 'no', 'its', 'it', 'this', 'that', 'as', 'how', 'what', 'who', 'which',
  'his', 'her', 'he', 'she', 'they', 'their', 'our', 'we', 'you', 'your',
  'up', 'out', 'about', 'into', 'over', 'after', 'new', 'says', 'said',
  // Farsi (häufige Kurzwörter)
  'و', 'در', 'به', 'از', 'که', 'با', 'را', 'این', 'آن', 'یک', 'بر', 'تا', 'هم',
])

/** Adaptive Batch-Size basierend auf Netzwerkqualität */
export function getAdaptiveBatchSize(): number {
  const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection
  if (!conn) return BATCH_SIZE
  const type = conn.effectiveType
  if (type === 'slow-2g' || type === '2g') return 1
  if (type === '3g') return 3
  if (type === '4g') return 6
  return 8 // WiFi / unbekannt
}
