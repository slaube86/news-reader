
// ── Proxy-Konfiguration ──────────────────────────────────────────
// Eigener Cloudflare Worker als primärer Proxy.
// WICHTIG: Nach dem Deploy die URL hier eintragen!
const PROXY_PRIMARY  = 'https://rss-cors-proxy.sebastian-laube.workers.dev/?url=';
const PROXY_FALLBACK = 'https://api.allorigins.win/raw?url=';
let PROXY = PROXY_PRIMARY;

const DB_NAME = 'IranNewsReaderDB';
const DB_VERSION = 1;
const STORE_NAME = 'savedArticles';

let _dbInstance = null;

function openDB() {
  if (_dbInstance) {
    try {
      if (_dbInstance.objectStoreNames.contains(STORE_NAME)) {
        return Promise.resolve(_dbInstance);
      }
    } catch (e) {
      _dbInstance = null;
    }
  }
  return new Promise((resolve, reject) => {
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      console.error('IndexedDB nicht verfügbar:', e);
      return reject(e);
    }
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.info('IndexedDB: Object Store erstellt');
      }
    };
    request.onblocked = () => {
      console.warn('IndexedDB: Verbindung blockiert – andere Tabs schließen');
    };
    request.onsuccess = () => {
      _dbInstance = request.result;
      _dbInstance.onclose = () => { _dbInstance = null; };
      _dbInstance.onversionchange = () => {
        _dbInstance.close();
        _dbInstance = null;
      };
      resolve(_dbInstance);
    };
    request.onerror = () => {
      console.error('IndexedDB open Fehler:', request.error);
      reject(request.error);
    };
  });
}

function saveArticlesToDB(articles) {
  if (!Array.isArray(articles) || articles.length === 0) return Promise.resolve();
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    articles.forEach(article => store.put(article));
    tx.oncomplete = () => {
      console.info(`IndexedDB: ${articles.length} Artikel gespeichert`);
      resolve();
    };
    tx.onerror = () => {
      console.error('IndexedDB save Fehler:', tx.error);
      reject(tx.error);
    };
    tx.onabort = () => {
      console.error('IndexedDB save abgebrochen:', tx.error);
      reject(tx.error || new Error('Transaction aborted'));
    };
  }));
}

function getSavedArticlesFromDB() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      console.error('IndexedDB read Fehler:', req.error);
      reject(req.error);
    };
  }));
}

const FEEDS = [
  { id: 'tagesschau', name: 'Tagesschau',   url: 'https://www.tagesschau.de/xml/rss2' },
  { id: 'spiegel',    name: 'Spiegel',      url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss' },
  { id: 'zdf',        name: 'ZDF heute',    url: 'https://www.zdf.de/rss/zdf/nachrichten' },
  { id: 'zeit',       name: 'Zeit Online',  url: 'https://newsfeed.zeit.de/all' },
  { id: 'nytimes',    name: 'NYTimes',      url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml' },
  { id: 'washpost',   name: 'WashingtonPost', url: 'https://feeds.washingtonpost.com/rss/world' },
  { id: 'npr',        name: 'NPR',          url: 'https://feeds.npr.org/1004/rss.xml' },
  { id: 'netblocks',  name: 'NetBlocks (Mastodon)', url: 'https://mastodon.social/@netblocks.rss' },
  { id: 'mehr',       name: 'Mehr News (FA)', url: 'https://www.mehrnews.com/rss' },
  { id: 'bbcpersian', name: 'BBC Persian',  url: 'https://www.bbc.com/persian/index.xml' },
];

const IRAN_TERMS = [
  'iran', 'tehran', 'teheran', 'chamenei', 'khamenei',
  'iranisch', 'iranische', 'hormus', 'persisch', 'mossad',
  'revolutionsgard', 'atomabkommen', 'jcpoa', 'isfahan',
  'iran war', 'nuclear', 'nuclear deal', 'sanctions', 'ayatollah',
  'Supreme Leader', 'revolution guard', 'Qom', 'Persian gulf', 'iranian',
  'mullah', 'reform movement', 'shah', 'nuclear program', 'caspian',
  'IRGC', 'Basij', 'cyberattack', 'internet cut', 'Watchdog', 'connectivity',
  'ایران', 'تهران', 'خامنه‌ای', 'سپاه', 'اصفهان', 'خلیج فارس', 'برجام', 'تحریم', 'ملا', 'شاه', 'هسته‌ای', 'موساد', 'نیروهای بسیج'
];

let allItems = [];
let currentSource = 'today';
let lastRefreshTimes = {};
let savedArticleIds = new Set();

function loadSavedArticlesIntoMemory() {
  return getSavedArticlesFromDB().then(items => {
    savedArticleIds = new Set(items.map(i => i.id));
    currentSource = 'today';
    filterSource('today');
    if (items.length) {
      allItems = items;
      updateSidebar();
      applyFilters();
      showToast('IndexedDB: Artikel geladen, suche nach Updates...');
    }
  }).catch((e) => {
    console.error('IndexedDB: loadSavedArticlesIntoMemory fehlgeschlagen:', e);
    savedArticleIds = new Set();
  });
}

function syncSavedArticleIds() {
  return getSavedArticlesFromDB().then(items => {
    savedArticleIds = new Set(items.map(i => i.id));
    updateSidebar();
    applyFilters();
  }).catch((e) => {
    console.error('IndexedDB: syncSavedArticleIds fehlgeschlagen:', e);
    savedArticleIds = new Set();
  });
}

function mergeArticles(baseItems, newItems) {
  const map = new Map();
  baseItems.forEach(item => map.set(item.id, item));
  newItems.forEach(item => map.set(item.id, item));
  const merged = Array.from(map.values());
  merged.sort((a, b) => new Date(b.date) - new Date(a.date));
  return merged;
}

function pruneOldArticles(days = 60) {
  const threshold = Date.now() - (days * 24 * 60 * 60 * 1000);
  allItems = allItems.filter(item => {
    const d = new Date(item.date);
    return isNaN(d) || d.getTime() >= threshold;
  });
  return removeOldArticlesFromDB(days);
}

function removeOldArticlesFromDB(days = 60) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();
    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const item = cursor.value;
        const d = new Date(item.date);
        if (!isNaN(d) && d.getTime() < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
    tx.oncomplete = resolve;
    tx.onerror = () => {
      console.error('IndexedDB prune Fehler:', tx.error);
      reject(tx.error);
    };
  }));
}

function isIranRelated(text) {
  const t = text.toLowerCase();
  return IRAN_TERMS.some(term => t.includes(term));
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getEl(el, tag) {
  const node = el.querySelector(tag);
  if (!node) return '';
  return (node.textContent || node.innerHTML).replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,'').trim();
}

function formatDate(str) {
  if (!str) return '';
  try {
    const d = new Date(str);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'2-digit',
                                           hour:'2-digit', minute:'2-digit' });
  } catch(e) { return ''; }
}

function isToday(str) {
  if (!str) return false;
  try {
    const d = new Date(str);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  } catch(e) { return false; }
}

function formatLastUpdated(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d)) return '';
    return d.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' });
  } catch (e) {
    return '';
  }
}

function showToast(message, duration = 2500) {
  let toast = document.getElementById('toastMessage');
  if (!toast) {
    const container = document.createElement('div');
    container.id = 'toastMessage';
    container.className = 'toast-message';
    document.body.appendChild(container);
    toast = container;
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast.hideTimeout);
  toast.hideTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

function showErrorToast(message, duration = 4000) {
  showToast(`⚠ ${message}`, duration);
}

async function fetchWithRetries(url, options, attempts = 2, timeoutMs = 15000) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '0', 10);
        const wait = retryAfter > 0 ? retryAfter * 1000 : Math.pow(3, i + 1) * 1000;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      // Exponential backoff: 1s, 3s
      const delay = Math.pow(3, i) * 1000;
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

async function fetchFeed(feed) {
  try {
    let res;
    let usedFallback = false;
    try {
      res = await fetchWithRetries(PROXY_PRIMARY + encodeURIComponent(feed.url), {}, 2, 15000);
    } catch (primaryErr) {
      // Fallback auf allorigins.win
      usedFallback = true;
      res = await fetchWithRetries(PROXY_FALLBACK + encodeURIComponent(feed.url), {}, 2, 20000);
    }
    let xmlString = await res.text();

    // AllOrigins Fallback kann Base64-data-URI zurückgeben
    if (usedFallback) {
      const dataUriMatch = xmlString.match(/^data:.*;base64,(.+)$/s);
      if (dataUriMatch) {
        try {
          xmlString = atob(dataUriMatch[1]);
        } catch (e) {
          throw new Error('Base64-Decoding fehlgeschlagen');
        }
      }
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    return Array.from(doc.querySelectorAll('item, entry'))
      .map(item => {
        let title = getEl(item, 'title');
        let desc = getEl(item, 'description') || getEl(item, 'summary') || getEl(item, 'content');
        let link = getEl(item, 'link');
        if (!link) {
          const linkNode = item.querySelector('link[rel="alternate"]') || item.querySelector('link');
          if (linkNode) {
            link = linkNode.getAttribute('href') || linkNode.textContent || '';
          }
        }
        const date = getEl(item, 'pubDate') || getEl(item, 'published') || getEl(item, 'updated') || new Date().toISOString();

        if (!title) {
          const plain = desc.replace(/<[^>]+>/g, '').trim();
          title = plain.split('\n').map(s=>s.trim()).filter(Boolean).shift() || `${feed.name} Update`;
        }

        const id = `${feed.id}-${Math.abs(hashCode(title + '|' + (link || '')))}`;
        return {
          id,
          title,
          desc,
          link,
          date,
          source:     feed.id,
          sourceName: feed.name,
        };
      })
      .filter(it => it.title && isIranRelated(it.title + ' ' + it.desc));
  } catch (e) {
    throw new Error(e.message || String(e));
  }
}

function getFilteredItems() {
  const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
  let items;
  if (currentSource === 'all') {
    items = [...allItems];
  } else if (currentSource === 'saved') {
    items = allItems.filter(i => savedArticleIds.has(i.id));
  } else {
    items = allItems.filter(i => i.source === currentSource);
  }
  if (keyword) items = items.filter(i => (i.title+' '+i.desc).toLowerCase().includes(keyword));

  const sort = document.getElementById('sortSelect').value;
  if (sort === 'date') {
    items.sort((a,b) => new Date(b.date) - new Date(a.date));
  } else {
    items.sort((a,b) => a.sourceName.localeCompare(b.sourceName) || new Date(b.date) - new Date(a.date));
  }
  return items;
}

function renderItems(items) {
  if (!items.length) {
    return `<div class="state-box">
      <span class="icon">📭</span>
      <p>Keine Artikel gefunden</p>
      <small>Versuche es erneut oder ändere den Filter</small>
    </div>`;
  }

  const sort = document.getElementById('sortSelect').value;

  if (sort === 'source') {
    const grouped = {};
    items.forEach(it => {
      if (!grouped[it.source]) grouped[it.source] = { name: it.sourceName, items: [] };
      grouped[it.source].items.push(it);
    });
    return Object.values(grouped).map(g => `
      <div class="feed-block">
        <div class="feed-header">
          <span class="feed-name">${g.name}</span>
          <span class="feed-count">${g.items.length} Artikel</span>
        </div>
        ${g.items.map(renderArticle).join('')}
      </div>`).join('');
  } else {
    return `<div class="feed-block">${items.map(renderArticle).join('')}</div>`;
  }
}

function translateArticle(text, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.textContent = 'Übersetzung wird geladen...';

  fetch(PROXY_PRIMARY.replace('/?url=', '/translate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source: 'fa', target: 'de' }),
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.translated_text) {
        target.textContent = data.translated_text;
      } else {
        target.textContent = 'Übersetzung fehlgeschlagen';
      }
    })
    .catch(() => {
      target.textContent = 'Übersetzung fehlgeschlagen';
    });
}

function addTranslateListeners() {
  document.querySelectorAll('.art-translate-btn').forEach(btn => {
    btn.removeEventListener('click', btn._translateHandler);
    const text = btn.getAttribute('data-translate-text');
    const targetId = btn.getAttribute('data-translate-target');
    const handler = (event) => {
      event.preventDefault();
      event.stopPropagation();
      translateArticle(text, targetId);
    };
    btn._translateHandler = handler;
    btn.addEventListener('click', handler);
  });
}

function renderArticle(it) {
  const tagClass = `tag-${it.source}`;
  const safeLink = (it.link || '#').replace(/"/g, '&quot;');
  const items = ['bbcpersian', 'mehr'];
  const isFarsi = items.includes(it.source);
  const translationId = `translate-${Math.random().toString(36).slice(2)}`;

  const translationText = `${it.title}${it.desc ? '\n\n' + it.desc : ''}`;
  const isSaved = savedArticleIds.has(it.id);
  return `<div class="article">
    <a href="${safeLink}" target="_blank" rel="noopener noreferrer">
      <div class="art-top">
        <span class="src-tag ${tagClass}">${it.sourceName}</span>
        <span class="art-date">${formatDate(it.date)}</span>
      </div>
      <div class="art-title">${it.title}</div>
      ${it.desc ? `<div class="art-desc">${it.desc}</div>` : ''}
    </a>
    ${isFarsi ? `<button class="art-translate-btn" data-translate-text="${escapeHtml(translationText)}" data-translate-target="${translationId}">Übersetzen</button>
    <div class="art-translation" id="${translationId}"></div>` : ''}
  </div>`;
}

function setFeedError(src, message, type = 'error') {
  const feedItem = document.querySelector(`.src-item[data-src="${src}"]`);
  if (!feedItem) return;
  let errEl = feedItem.querySelector('.src-feed-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'src-feed-error';
    feedItem.appendChild(errEl);
  }
  const icon = type === 'info' ? 'ℹ️' : '❗';
  errEl.textContent = icon;
  errEl.title = message;
}

function clearFeedError(src) {
  const feedItem = document.querySelector(`.src-item[data-src="${src}"]`);
  if (!feedItem) return;
  const errEl = feedItem.querySelector('.src-feed-error');
  if (errEl) errEl.remove();
}

function clearAllFeedErrors() {
  FEEDS.forEach(f => clearFeedError(f.id));
}

function updateSidebar() {
  const counts = {};
  FEEDS.forEach(f => counts[f.id] = 0);
  allItems.forEach(it => { if (counts[it.source] !== undefined) counts[it.source]++; });
  const savedCount = allItems.filter(i => savedArticleIds.has(i.id)).length;

  document.getElementById('cnt-all').textContent = allItems.length;
  document.getElementById('cnt-saved').textContent = savedCount;
  FEEDS.forEach(f => {
    const countEl = document.getElementById('cnt-' + f.id);
    if (countEl) countEl.textContent = counts[f.id];
  });
}

async function refreshSource(src) {
  const feed = FEEDS.find(f => f.id === src);
  if (!feed) return;

  const btn = document.querySelector(`.src-item[data-src="${src}"] .src-refresh-btn`);
  if (btn) {
    btn.disabled = true;
    btn.classList.add('loading');
  }

  try {
    const items = await fetchFeed(feed);
    if (items.length > 0) {
      allItems = mergeArticles(allItems.filter(i => i.source !== src), items);
    }
    lastRefreshTimes[src] = new Date().toISOString();
    clearFeedError(src);
    updateSidebar();
    applyFilters();
    if (items.length === 0) {
      setFeedError(src, 'Keine passenden Iran-Artikel gefunden', 'info');
      showErrorToast(`${feed.name}: Keine passenden Iran-Artikel gefunden`, 4500);
    } else {
      clearFeedError(src);
      showToast(`${feed.name} aktualisiert (${items.length} Artikel)`);
    }
    try {
      await saveArticlesToDB(allItems);
      await pruneOldArticles(60);
      await syncSavedArticleIds();
    } catch (dbErr) {
      console.error('IndexedDB Fehler (refreshSource):', dbErr);
    }
  } catch (e) {
    setFeedError(src, e.message || e, 'error');
    showErrorToast(`${feed.name}: ${e.message || e}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  }
}

function updateStats(items) {
  const sources = new Set(items.map(i => i.source)).size;
  const today = items.filter(i => isToday(i.date)).length;
  document.getElementById('totalCount').textContent = items.length;
  document.getElementById('sourceCount').textContent = sources;
  document.getElementById('todayCount').textContent = today;
  document.getElementById('statsBar').style.display = 'flex';

  const now = new Date();
  document.getElementById('lastUpdate').textContent =
    'Stand ' + now.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' });
}

function filterSource(src) {
  currentSource = src;
  document.querySelectorAll('.src-item').forEach(el => {
    el.classList.toggle('active', el.dataset.src === src);
  });
  applyFilters();
}

function applyFilters() {
  const items = getFilteredItems();
  document.getElementById('content').innerHTML = renderItems(items);
  addTranslateListeners();
  updateStats(items);
}

async function loadAll() {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.classList.add('spinning');
    btn.disabled = true;
  }
  document.getElementById('content').innerHTML =
    `<div class="state-box"><div class="loader"></div><p>Lade Iran-Nachrichten…</p></div>`;
  document.getElementById('statsBar').style.display = 'none';

  // Feeds in Batches laden (4 gleichzeitig, 500ms Pause)
  const BATCH_SIZE = 4;
  const results = [];
  for (let i = 0; i < FEEDS.length; i += BATCH_SIZE) {
    const batch = FEEDS.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(fetchFeed));
    results.push(...batchResults);
    if (i + BATCH_SIZE < FEEDS.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  const errors = [];
  clearAllFeedErrors();
  const fetchedItems = results.flatMap((r, i) => {
    if (r.status === 'fulfilled') {
      clearFeedError(FEEDS[i].id);
      lastRefreshTimes[FEEDS[i].id] = new Date().toISOString();
      return r.value;
    }
    const msg = r.reason && r.reason.message ? r.reason.message : String(r.reason);
    const sourceId = FEEDS[i].id;
    setFeedError(sourceId, msg, 'error');
    errors.push(`${FEEDS[i].name}: ${msg}`);
    return [];
  });

  if (errors.length) {
    showErrorToast(`Konnte nicht laden: ${errors.join(', ')}. CORS-Proxy kann zeitweise überlastet sein.`, 5000);
  }

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      lastRefreshTimes[FEEDS[i].id] = new Date().toISOString();
    }
  });

  if (!fetchedItems.length && errors.length === FEEDS.length) {
    const savedItems = await getSavedArticlesFromDB().catch(() => []);
    if (savedItems && savedItems.length) {
      allItems = savedItems;
      savedArticleIds = new Set(savedItems.map(i => i.id));
      await syncSavedArticleIds();
      updateSidebar();
      applyFilters();
      showToast('Offline-Modus: Artikel aus IndexedDB geladen');
    } else {
      document.getElementById('content').innerHTML =
        `<div class="state-box">
          <span class="icon">⚠</span>
          <p>Keine Verbindung zu den Feeds</p>
          <small>Internetverbindung prüfen und erneut versuchen</small>
        </div>`;
      showErrorToast('Keine Verbindung zu den Feeds', 5000);
    }
  } else {
    const prev = allItems;
    const hasChanged = JSON.stringify(prev) !== JSON.stringify(fetchedItems);

    const savedItems = await getSavedArticlesFromDB().catch(() => []);
    allItems = mergeArticles(savedItems, fetchedItems);
    updateSidebar();
    applyFilters();
    showToast('Alle Quellen wurden aktualisiert');

    if (hasChanged) {
      console.info('Cache aktualisiert: neue/aktualisierte Artikel gefunden');
    }
    try {
      await saveArticlesToDB(allItems);
      await pruneOldArticles(60);
      await syncSavedArticleIds();
    } catch (dbErr) {
      console.error('IndexedDB Fehler (loadAll):', dbErr);
    }
  }

  if (btn) {
    btn.classList.remove('spinning');
    btn.disabled = false;
  }
}

loadSavedArticlesIntoMemory().then(() => loadAll()).catch(() => {
  // Falls DB nicht verfügbar, weiter mit normaler Feed-Lade-Logik
  loadAll();
});

// Auto-Refresh alle 15 Minuten (reduziert Proxy-Last)
setInterval(loadAll, 15 * 60 * 1000);
