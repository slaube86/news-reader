// Cloudflare Worker – CORS-Proxy für RSS-Feeds
// Nur whitelisted Feed-Domains werden durchgelassen.

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
  'www.iranintl.com'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CACHE_TTL = 300; // 5 Minuten

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── Übersetzungs-Endpoint ──
    if (url.pathname === '/translate' && request.method === 'POST') {
      return handleTranslate(request, env);
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

    // Feed abrufen
    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'IranNewsReader-Proxy/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        redirect: 'follow',
      });

      if (!upstream.ok) {
        return jsonError(upstream.status, `Upstream returned ${upstream.status}`);
      }

      const body = await upstream.text();

      const response = new Response(body, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': upstream.headers.get('Content-Type') || 'text/xml',
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
          'X-Proxy-Cache': 'MISS',
        },
      });

      // In Cache ablegen
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;
    } catch (err) {
      return jsonError(502, `Fetch failed: ${err.message}`);
    }
  },
};

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
