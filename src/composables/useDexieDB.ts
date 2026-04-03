import Dexie from 'dexie'
import type { Article } from '@/types/article'
import { DEXIE_DB_NAME, PRUNE_DAYS, PAGE_SIZE } from '@/config/constants'
import { toRaw } from 'vue'

// ── Dexie Database Definition ──
class NewsReaderDB extends Dexie {
  articles!: Dexie.Table<Article, string>

  constructor() {
    super(DEXIE_DB_NAME)
    this.version(1).stores({
      articles: 'id, date, source, [date+source]',
    })
  }
}

const db = new NewsReaderDB()

// ── Einmalige Migration von altem IndexedDB ──
let migrationDone = false

async function migrateFromLegacyDB(): Promise<void> {
  if (migrationDone) return
  migrationDone = true

  // Prüfen ob bereits Daten in Dexie vorhanden sind
  const count = await db.articles.count()
  if (count > 0) return

  // Alte DB "IranNewsReaderDB" auslesen
  try {
    const legacyDb = await new Promise<IDBDatabase | null>((resolve) => {
      const req = indexedDB.open('IranNewsReaderDB', 3)
      req.onsuccess = () => {
        const db = req.result
        if (!db.objectStoreNames.contains('savedArticles')) {
          db.close()
          resolve(null)
          return
        }
        resolve(db)
      }
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    })

    if (!legacyDb) return

    const items = await new Promise<Article[]>((resolve, reject) => {
      const tx = legacyDb.transaction('savedArticles', 'readonly')
      const req = tx.objectStore('savedArticles').getAll()
      req.onsuccess = () => resolve(req.result as Article[])
      req.onerror = () => reject(req.error)
    })

    legacyDb.close()

    if (items.length > 0) {
      await db.articles.bulkPut(items)
      console.info(`Dexie: ${items.length} Artikel aus altem IndexedDB migriert`)
    }

    // Alte DB löschen
    indexedDB.deleteDatabase('IranNewsReaderDB')
    console.info('Dexie: Alte IndexedDB gelöscht')
  } catch (e) {
    console.warn('Dexie: Migration von altem IndexedDB fehlgeschlagen:', e)
  }
}

// ── Public API ──

export async function initDB(): Promise<void> {
  await db.open()
  await migrateFromLegacyDB()
}

export async function saveArticlesToDexie(articles: Article[]): Promise<void> {
  if (!articles.length) return
  const plain = articles.map((a) => {
    const raw = toRaw(a)
    return {
      id: raw.id,
      title: raw.title,
      desc: raw.desc,
      link: raw.link,
      date: raw.date,
      source: raw.source,
      sourceName: raw.sourceName,
    }
  })
  await db.articles.bulkPut(plain)
}

export async function getAllArticlesFromDexie(): Promise<Article[]> {
  return db.articles.toArray()
}

export async function getArticlesBySource(source: string): Promise<Article[]> {
  return db.articles.where('source').equals(source).toArray()
}

export async function getArticlesPaginated(page: number, source?: string): Promise<Article[]> {
  const collection = source
    ? db.articles.where('source').equals(source)
    : db.articles.orderBy('date')

  return collection
    .reverse()
    .offset(page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray()
}

export async function getArticleCount(source?: string): Promise<number> {
  if (source) {
    return db.articles.where('source').equals(source).count()
  }
  return db.articles.count()
}

export async function pruneOldArticles(days: number = PRUNE_DAYS): Promise<number> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const old = await db.articles.where('date').below(cutoff).toArray()
  const ids = old.filter((a) => {
    const d = new Date(a.date)
    return !isNaN(d.getTime())
  }).map((a) => a.id)
  await db.articles.bulkDelete(ids)
  return ids.length
}

export async function getArticleIds(): Promise<Set<string>> {
  const keys = await db.articles.toCollection().primaryKeys()
  return new Set(keys as string[])
}
