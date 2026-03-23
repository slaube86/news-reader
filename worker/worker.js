// Cloudflare Worker – CORS-Proxy für RSS-Feeds
// Nur whitelisted Feed-Domains werden durchgelassen.

const ALLOWED_HOSTS = [
  'www.tagesschau.de',
  'www.spiegel.de',
  'www.zdf.de',
  'newsfeed.zeit.de',
  'rss.nytimes.com',
  'feeds.washingtonpost.com',
  'rss.cnn.com',
  'feeds.npr.org',
  'mastodon.social',
  'www.mehrnews.com',
  'www.bbc.com',
  'www.presstv.ir',
  'www.iranintl.com'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CACHE_TTL = 300; // 5 Minuten

export default {
  async fetch(request, env, ctx) {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return jsonError(405, 'Only GET requests allowed');
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

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

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}
