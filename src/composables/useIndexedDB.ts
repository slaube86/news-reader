import type { Article } from '@/types/article'
import { toRaw } from 'vue'
import { DB_NAME, DB_VERSION, STORE_NAME } from '@/config/constants'

let _dbInstance: IDBDatabase | null = null

// Alte DB "savedArticles" aufräumen (Überbleibsel früherer Version)
try {
  indexedDB.deleteDatabase('savedArticles')
} catch {
  /* ignore */
}

function openDB(): Promise<IDBDatabase> {
  if (_dbInstance) {
    try {
      if (_dbInstance.objectStoreNames.contains(STORE_NAME)) {
        return Promise.resolve(_dbInstance)
      }
    } catch {
      _dbInstance = null
    }
  }

  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION)
    } catch (e) {
      console.error('IndexedDB nicht verfügbar:', e)
      return reject(e)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        console.info('IndexedDB: Object Store erstellt')
      }
    }

    request.onblocked = () => {
      console.warn('IndexedDB: Verbindung blockiert – andere Tabs schließen')
    }

    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.warn('IndexedDB: Store fehlt nach open – lösche DB und erstelle neu')
        db.close()
        const delReq = indexedDB.deleteDatabase(DB_NAME)
        delReq.onsuccess = () => {
          _dbInstance = null
          openDB().then(resolve, reject)
        }
        delReq.onerror = () => {
          console.error('IndexedDB: DB löschen fehlgeschlagen')
          reject(delReq.error)
        }
        return
      }
      _dbInstance = db
      _dbInstance.onclose = () => {
        _dbInstance = null
      }
      _dbInstance.onversionchange = () => {
        _dbInstance?.close()
        _dbInstance = null
      }
      resolve(_dbInstance)
    }

    request.onerror = () => {
      console.error('IndexedDB open Fehler:', request.error)
      reject(request.error)
    }
  })
}

export function saveArticlesToDB(articles: Article[]): Promise<void> {
  if (!Array.isArray(articles) || articles.length === 0) return Promise.resolve()
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        articles.forEach((article) => {
          const rawArticle = toRaw(article)
          store.put({
            id: rawArticle.id,
            title: rawArticle.title,
            desc: rawArticle.desc,
            link: rawArticle.link,
            date: rawArticle.date,
            source: rawArticle.source,
            sourceName: rawArticle.sourceName,
          })
        })
        tx.oncomplete = () => {
          console.info(`IndexedDB: ${articles.length} Artikel gespeichert`)
          resolve()
        }
        tx.onerror = () => {
          console.error('IndexedDB save Fehler:', tx.error)
          reject(tx.error)
        }
        tx.onabort = () => {
          console.error('IndexedDB save abgebrochen:', tx.error)
          reject(tx.error || new Error('Transaction aborted'))
        }
      }),
  )
}

export function getSavedArticlesFromDB(): Promise<Article[]> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).getAll()
        req.onsuccess = () => resolve(req.result as Article[])
        req.onerror = () => {
          console.error('IndexedDB read Fehler:', req.error)
          reject(req.error)
        }
      }),
  )
}

export function removeOldArticlesFromDB(days: number = 60): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const req = store.openCursor()
        req.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
          if (cursor) {
            const item = cursor.value as Article
            const d = new Date(item.date)
            if (!isNaN(d.getTime()) && d.getTime() < cutoff) {
              cursor.delete()
            }
            cursor.continue()
          }
        }
        tx.oncomplete = () => resolve()
        tx.onerror = () => {
          console.error('IndexedDB prune Fehler:', tx.error)
          reject(tx.error)
        }
      }),
  )
}
