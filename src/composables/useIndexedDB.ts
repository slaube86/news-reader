import type { Article } from '@/types/article'
import { toRaw } from 'vue'
import { DB_NAME, DB_VERSION, STORE_NAME } from '@/config/constants'

let _dbInstance: IDBDatabase | null = null
const OPEN_RETRY_DELAY_MS = 800
const MAX_OPEN_RETRIES = 1

// Alte DB "savedArticles" aufräumen (Überbleibsel früherer Version)
try {
  indexedDB.deleteDatabase('savedArticles')
} catch {
  /* ignore */
}

function resetDbConnection(reason: string) {
  if (_dbInstance) {
    try {
      _dbInstance.close()
    } catch {
      /* ignore */
    }
  }
  _dbInstance = null
  console.warn(`IndexedDB: Verbindung zurückgesetzt (${reason})`, {
    dbName: DB_NAME,
    dbVersion: DB_VERSION,
    storeName: STORE_NAME,
  })
}

function openDB(retryCount = 0): Promise<IDBDatabase> {
  if (_dbInstance) {
    try {
      if (_dbInstance.objectStoreNames.contains(STORE_NAME)) {
        return Promise.resolve(_dbInstance)
      }
    } catch {
      resetDbConnection('ungueltige bestehende Verbindung')
    }
  }

  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest
    let settled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const finalizeReject = (error: unknown) => {
      if (settled) return
      settled = true
      if (retryTimer) clearTimeout(retryTimer)
      reject(error)
    }

    const finalizeResolve = (db: IDBDatabase) => {
      if (settled) return
      settled = true
      if (retryTimer) clearTimeout(retryTimer)
      resolve(db)
    }

    try {
      request = indexedDB.open(DB_NAME, DB_VERSION)
    } catch (e) {
      console.error('IndexedDB nicht verfügbar:', e)
      return finalizeReject(e)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      console.info('IndexedDB: Upgrade gestartet', {
        dbName: DB_NAME,
        dbVersion: DB_VERSION,
        storeName: STORE_NAME,
        oldVersion: event.oldVersion,
        newVersion: event.newVersion,
      })
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        console.info('IndexedDB: Object Store erstellt')
      }
    }

    request.onblocked = () => {
      console.warn('IndexedDB: Verbindung blockiert', {
        dbName: DB_NAME,
        dbVersion: DB_VERSION,
        storeName: STORE_NAME,
        retryCount,
        hint: 'Safari haelt manchmal alte Handles offen. Andere Tabs schliessen oder Browser neu starten.',
      })
      resetDbConnection('open blockiert')

      if (retryCount < MAX_OPEN_RETRIES) {
        retryTimer = setTimeout(() => {
          openDB(retryCount + 1).then(finalizeResolve, finalizeReject)
        }, OPEN_RETRY_DELAY_MS)
      } else {
        finalizeReject(new Error('IndexedDB blockiert: Bitte andere Tabs schliessen oder Safari neu starten'))
      }
    }

    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.warn('IndexedDB: Store fehlt nach open – lösche DB und erstelle neu')
        db.close()
        const delReq = indexedDB.deleteDatabase(DB_NAME)
        delReq.onsuccess = () => {
          resetDbConnection('Store fehlte nach open')
          openDB().then(finalizeResolve, finalizeReject)
        }
        delReq.onerror = () => {
          console.error('IndexedDB: DB löschen fehlgeschlagen')
          finalizeReject(delReq.error)
        }
        return
      }
      _dbInstance = db
      _dbInstance.onclose = () => {
        _dbInstance = null
      }
      _dbInstance.onversionchange = () => {
        resetDbConnection('versionchange')
      }
      console.info('IndexedDB: Verbindung geöffnet', {
        dbName: DB_NAME,
        dbVersion: db.version,
        storeName: STORE_NAME,
        retryCount,
      })
      finalizeResolve(_dbInstance)
    }

    request.onerror = () => {
      console.error('IndexedDB open Fehler:', {
        error: request.error,
        dbName: DB_NAME,
        dbVersion: DB_VERSION,
        storeName: STORE_NAME,
        retryCount,
      })

      if (retryCount < MAX_OPEN_RETRIES) {
        resetDbConnection('open Fehler')
        retryTimer = setTimeout(() => {
          openDB(retryCount + 1).then(finalizeResolve, finalizeReject)
        }, OPEN_RETRY_DELAY_MS)
        return
      }

      finalizeReject(request.error)
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
          console.info('IndexedDB: Artikel gespeichert', {
            count: articles.length,
            dbName: DB_NAME,
            dbVersion: db.version,
            storeName: STORE_NAME,
          })
          resolve()
        }
        tx.onerror = () => {
          console.error('IndexedDB save Fehler:', {
            error: tx.error,
            count: articles.length,
            dbName: DB_NAME,
            dbVersion: db.version,
            storeName: STORE_NAME,
          })
          reject(tx.error)
        }
        tx.onabort = () => {
          console.error('IndexedDB save abgebrochen:', {
            error: tx.error,
            count: articles.length,
            dbName: DB_NAME,
            dbVersion: db.version,
            storeName: STORE_NAME,
          })
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
        req.onsuccess = () => {
          console.info('IndexedDB: Artikel gelesen', {
            count: req.result.length,
            dbName: DB_NAME,
            dbVersion: db.version,
            storeName: STORE_NAME,
          })
          resolve(req.result as Article[])
        }
        req.onerror = () => {
          console.error('IndexedDB read Fehler:', {
            error: req.error,
            dbName: DB_NAME,
            dbVersion: db.version,
            storeName: STORE_NAME,
          })
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
        tx.oncomplete = () => {
          console.info('IndexedDB: Alte Artikel bereinigt', {
            cutoff,
            dbName: DB_NAME,
            dbVersion: db.version,
            storeName: STORE_NAME,
          })
          resolve()
        }
        tx.onerror = () => {
          console.error('IndexedDB prune Fehler:', {
            error: tx.error,
            cutoff,
            dbName: DB_NAME,
            dbVersion: db.version,
            storeName: STORE_NAME,
          })
          reject(tx.error)
        }
      }),
  )
}
