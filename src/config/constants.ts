export const PROXY_PRIMARY = 'https://rss-cors-proxy.sebastian-laube.workers.dev/?url=' as const
export const PROXY_FALLBACK = 'https://api.allorigins.win/raw?url=' as const
export const TRANSLATE_URL = 'https://rss-cors-proxy.sebastian-laube.workers.dev/translate' as const

export const DB_NAME = 'IranNewsReaderDB' as const
export const DB_VERSION = 3
export const STORE_NAME = 'savedArticles' as const

export const BATCH_SIZE = 4
export const REFRESH_INTERVAL = 15 * 60 * 1000 // 15 Minuten in ms
export const REFRESH_SECONDS = 900 // 15 Minuten in Sekunden
export const PRUNE_DAYS = 60
