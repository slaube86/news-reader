// Cloudflare Worker – CORS-Proxy für RSS-Feeds
// Features: Whitelisted Domains, ETag-Passthrough, Feed-Aggregator, Rate-Limiting

const ALLOWED_HOSTS = [
  'www.tagesschau.de',
  'www.spiegel.de',
  'www.zdf.de',
  'newsfeed.zeit.de',
  'rss.nytimes.com',
  'feeds.washingtonpost.com',
  'feeds.npr.org',
  'mastodon.social',
  'www.mehrnews.com',
  'www.bbc.com',
  'www.iranintl.com',
  'www.aljazeera.com',
  'www.entekhab.ir',
  'correctiv.org',
  'www.bellingcat.com'
];

const FEEDS = [
  { id: 'tagesschau', name: 'Tagesschau', url: 'https://www.tagesschau.de/xml/rss2' },
  { id: 'spiegel', name: 'Spiegel', url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss' },
  { id: 'zdf', name: 'ZDF heute', url: 'https://www.zdf.de/rss/zdf/nachrichten' },
  { id: 'iranintl', name: 'Iran International', url: 'https://www.iranintl.com/feed' },
  { id: 'zeit', name: 'Zeit Online', url: 'https://newsfeed.zeit.de/all' },
  { id: 'nytimes', name: 'NYTimes', url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml' },
  { id: 'washpost', name: 'WashingtonPost', url: 'https://feeds.washingtonpost.com/rss/world' },
  { id: 'npr', name: 'NPR', url: 'https://feeds.npr.org/1004/rss.xml' },
  { id: 'netblocks', name: 'NetBlocks (Mastodon)', url: 'https://mastodon.social/@netblocks.rss' },
  { id: 'mehr', name: 'Mehr News (FA)', url: 'https://www.mehrnews.com/rss' },
  { id: 'bbcpersian', name: 'BBC Persian', url: 'https://www.bbc.com/persian/index.xml' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'entekhab', name: 'Entekhab (FA)', url: 'https://www.entekhab.ir/fa/rss/allnews' },
  { id: 'correctiv', name: 'CORRECTIV', url: 'https://correctiv.org/feed/' },
  { id: 'bellingcat', name: 'Bellingcat', url: 'https://www.bellingcat.com/feed/' },
];

const IRAN_TERMS = [
  'iran', 'tehran', 'teheran', 'chamenei', 'khamenei',
  'iranisch', 'iranische', 'hormus', 'persisch', 'mossad',
  'revolutionsgard', 'atomabkommen', 'jcpoa', 'isfahan',
  'nuclear', 'nuclear deal', 'sanctions', 'ayatollah',
  'revolution guard', 'persian gulf', 'iranian',
  'mullah', 'shah', 'nuclear program', 'caspian',
  'irgc', 'basij', 'cyberattack', 'internet cut', 'watchdog', 'connectivity',
  'ایران', 'تهران', 'خامنه‌ای', 'سپاه', 'اصفهان', 'خلیج فارس', 'برجام', 'تحریم', 'ملا', 'شاه', 'هسته‌ای', 'موساد', 'نیروهای بسیج',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, If-Modified-Since',
};

const CACHE_TTL = 300; // 5 Minuten
const RATE_LIMIT_WINDOW = 60; // 60 Sekunden
const RATE_LIMIT_MAX = 60; // Max Requests pro Fenster

// ── In-Memory Rate-Limiter ──
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW * 1000) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── Rate-Limiting ──
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
          'Retry-After': String(RATE_LIMIT_WINDOW),
        },
      });
    }

    // ── Übersetzungs-Endpoint ──
    if (url.pathname === '/translate' && request.method === 'POST') {
      return handleTranslate(request, env);
    }

    // ── Feed-Aggregator Endpoint ──
    if (url.pathname === '/feeds/all' && request.method === 'GET') {
      return handleAggregator(request, env, ctx);
    }

    if (request.method !== 'GET') {
      return jsonError(405, 'Only GET or POST /translate allowed');
    }

    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return jsonError(400, 'Missing ?url= parameter');
    }

    // URL validieren
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return jsonError(400, 'Invalid URL');
    }

    // Nur erlaubte Hosts
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return jsonError(403, `Host not allowed: ${parsed.hostname}`);
    }

    // Nur HTTP(S)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return jsonError(400, 'Only http/https URLs allowed');
    }

    // Cache prüfen (Cloudflare Cache API)
    const cacheKey = new Request(request.url, request);
    const cache = caches.default;
    let cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    // Feed abrufen – ETag/Last-Modified vom Client weiterleiten
    try {
      const upstreamHeaders = {
        'User-Agent': 'IranNewsReader-Proxy/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      };
      const clientEtag = request.headers.get('If-None-Match');
      const clientModified = request.headers.get('If-Modified-Since');
      if (clientEtag) upstreamHeaders['If-None-Match'] = clientEtag;
      if (clientModified) upstreamHeaders['If-Modified-Since'] = clientModified;

      const upstream = await fetch(targetUrl, {
        headers: upstreamHeaders,
        redirect: 'follow',
      });

      // 304 Not Modified direkt durchreichen
      if (upstream.status === 304) {
        return new Response(null, {
          status: 304,
          headers: CORS_HEADERS,
        });
      }

      if (!upstream.ok) {
        return jsonError(upstream.status, `Upstream returned ${upstream.status}`);
      }

      const body = await upstream.text();

      const responseHeaders = {
        ...CORS_HEADERS,
        'Content-Type': upstream.headers.get('Content-Type') || 'text/xml',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
        'X-Proxy-Cache': 'MISS',
      };
      // ETag/Last-Modified vom Upstream durchreichen
      const upstreamEtag = upstream.headers.get('ETag');
      const upstreamModified = upstream.headers.get('Last-Modified');
      if (upstreamEtag) responseHeaders['ETag'] = upstreamEtag;
      if (upstreamModified) responseHeaders['Last-Modified'] = upstreamModified;

      const response = new Response(body, {
        status: 200,
        headers: responseHeaders,
      });

      // In Cache ablegen
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;
    } catch (err) {
      return jsonError(502, `Fetch failed: ${err.message}`);
    }
  },
};

// ── Feed-Aggregator: Alle Feeds parallel laden und als JSON liefern ──
async function handleAggregator(request, env, ctx) {
  // Aggregator-Cache: 5 Minuten
  const cache = caches.default;
  const cacheKey = new Request(request.url);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const feedResults = {};

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const upstream = await fetch(feed.url, {
          headers: {
            'User-Agent': 'IranNewsReader-Proxy/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(12000),
        });

        if (!upstream.ok) {
          feedResults[feed.id] = { articles: [], error: `HTTP ${upstream.status}` };
          return;
        }

        const xmlText = await upstream.text();
        const articles = parseXmlToArticles(xmlText, feed);
        feedResults[feed.id] = { articles };
      } catch (err) {
        feedResults[feed.id] = { articles: [], error: err.message };
      }
    })
  );

  const body = JSON.stringify({ feeds: feedResults, timestamp: new Date().toISOString() });
  const response = new Response(body, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_TTL}`,
    },
  });

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

// ── Server-seitiges XML-Parsing (Duplikat der Client-Logik) ──
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isIranRelated(text) {
  const t = text.toLowerCase();
  return IRAN_TERMS.some(term => t.includes(term));
}

function getElText(el, tag) {
  // Cloudflare Workers haben keinen DOMParser, daher Regex-basiert
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = el.match(regex);
  if (!match) return '';
  return match[1]
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function parseXmlToArticles(xmlText, feed) {
  const articles = [];
  // RSS <item> oder Atom <entry> finden
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    let title = getElText(block, 'title');
    const desc = getElText(block, 'description') || getElText(block, 'summary') || getElText(block, 'content');

    let link = getElText(block, 'link');
    if (!link) {
      // Atom-style <link href="..."/>
      const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
      if (linkMatch) link = linkMatch[1];
    }

    const date = getElText(block, 'pubDate') || getElText(block, 'published') || getElText(block, 'updated');

    if (!title) {
      const plain = desc.replace(/<[^>]+>/g, '').trim();
      title = plain.split('\n').map(s => s.trim()).filter(Boolean).shift() || `${feed.name} Update`;
    }

    const combined = title + ' ' + desc;
    if (!title || !isIranRelated(combined)) continue;

    const id = `${feed.id}-${hashCode(title + '|' + (link || ''))}`;
    articles.push({ id, title, desc, link, date, source: feed.id, sourceName: feed.name });
  }

  return articles;
}

// ── Übersetzung via Workers AI (m2m100) ──
const MAX_CHUNK_LENGTH = 1024;

async function handleTranslate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const { text, source = 'fa', target = 'de' } = body;
  if (!text || typeof text !== 'string') {
    return jsonError(400, 'Missing "text" field');
  }

  try {
    // Langen Text in Chunks aufteilen (an Satzgrenzen)
    const chunks = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);
    const translations = [];

    for (const chunk of chunks) {
      const result = await env.AI.run('@cf/meta/m2m100-1.2b', {
        text: chunk,
        source_lang: source,
        target_lang: target,
      });
      translations.push(result.translated_text);
    }

    return new Response(JSON.stringify({ translated_text: translations.join(' ') }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return jsonError(502, `Translation failed: ${err.message}`);
  }
}

function splitTextIntoChunks(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    // Am letzten Satzendezeichen vor maxLen schneiden
    let cut = remaining.lastIndexOf('.', maxLen);
    if (cut < maxLen * 0.3) cut = remaining.lastIndexOf(' ', maxLen);
    if (cut < maxLen * 0.3) cut = maxLen;
    chunks.push(remaining.slice(0, cut + 1).trim());
    remaining = remaining.slice(cut + 1).trim();
  }
  return chunks;
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}
