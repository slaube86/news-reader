# Iran News Reader

**[Live Demo](https://news-reader-9h9o.onrender.com)**

A lightweight, responsive web reader for Iran-related news from various RSS feeds. Built by Sebastian Laube, this app loads content directly from the sources — it does not store its own articles but aggregates and filters existing feeds.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue 3 | 3.5 | UI framework (Composition API, `<script setup>`) |
| Vite | 8.0 | Dev server & build tool |
| Pinia | 3.0 | State management |
| Vue Router | 4.6 | Routing (prepared for future expansion) |
| TypeScript | 5.9 | Type safety |
| Leaflet.js | 1.9 | Interactive world map with heatmap markers |
| Chart.js | 4.x | Dual-axis line chart in rice price dialog (lazy-loaded) |
| ESLint | 10.1 | Linting (flat config with `eslint-plugin-vue` + `typescript-eslint`) |
| Cloudflare Workers | — | CORS proxy, 25-feed aggregator & locale-aware translation DE/EN/FA (Workers AI) |
| Dexie.js | 4.x | IndexedDB wrapper with indexes & typed queries |
| IndexedDB | — | Offline article storage (60 days, via Dexie.js) |

## Features

- Supports 25 sources: Tagesschau, Spiegel, ZDF, Zeit, NYTimes, Washington Post, NPR, NetBlocks, Mehr News (FA), BBC Persian, Iran International, Al Jazeera, Entekhab (FA), CORRECTIV, Bellingcat, Amnesty International, IGFM, Human Rights Watch, Iran Human Rights, Radio Farda (FA), VOA Persian (FA), NCRI, PBS NewsHour, Crisis Group, UN News.
- Filter by source, keyword search, sorting (date/source).
- Auto-refresh every 15 minutes with countdown display.
- Mobile sidebar with slide-in/slide-out, overlay, and auto-close on feed selection.
- Sidebar grouped by language: 🇩🇪 German → 🇮🇷 Persian → 🇺🇸 American → ⚖️ Human Rights → 🌐 Other.
- Sidebar footer with copyright, disclaimer, and GitHub link.
- **Locale-Aware Translation**: Every article whose source language differs from the user's browser language gets a translate button. The translation target is automatically derived from `navigator.language` and supports three languages — German (`de`), English (`en`), and Farsi (`fa`). Translation is powered by Cloudflare Workers AI (`m2m100-1.2b`). The button label always shows the target language name (e.g. "Übersetzen → English", "Translate → Deutsch", "Translate → فارسی").

  | Browser language | Translate button appears on | Button label example |
  |---|---|---|
  | `de` (German) | English + Farsi articles | Übersetzen → Deutsch |
  | `en` (English) | German + Farsi articles | Translate → English |
  | `fa` (Farsi) | German + English articles | Translate → فارسی |
  | Any other | German + Farsi articles | Translate → English |

- **Infinite Scroll Pagination**: Articles load in pages of 50 with automatic loading via Intersection Observer.
- **Daily Summary**: Collapsible card above the article list (visible in "Heute" view) showing top sources, mentioned countries (with flags), trending keywords, and time distribution — all computed client-side.
- **Rice Price Widget**: Compact card at the bottom of the Daily Summary showing the current 1 kg world market rice price in EUR and IRR. Clicking opens a full modal with a Chart.js dual-axis line chart covering the last 12 months. Price basis: Numbeo market estimate ($3.25/kg, manually updated every ~2 weeks). EUR conversion via Frankfurter API; IRR/EUR live rate via the [SamadiPour bonbast.com GitHub archive](https://github.com/SamadiPour/rial-exchange-rates-archive) (daily, CORS-free via jsDelivr CDN). All three sources are fetched in parallel with `Promise.allSettled`; individual source failures fall back gracefully. Results are cached in `localStorage` for 24 hours. The "vs. previous month" label shows the actual month name (e.g. "vs. Apr '26") to make clear which data point is being compared.
- **Interactive World Map**: Toggle map view via "🗺️ Karte" button. Displays an interactive Leaflet.js map with circle markers sized by article count per country. 45 countries with multilingual keyword detection (German, English, Farsi). Sidebar shows country list with article counts; clicking a country flies the map to its location and shows a detail panel with source breakdown and article links.
- **Welcome Modal**: First-visit welcome dialog with typewriter animation explaining the project's motivation. Dismissible with "Don't show again" checkbox (persisted in localStorage). Includes GitHub link.
- **Internationalization (i18n)**: All UI texts automatically switch between German and English based on `navigator.language`. Central translation system via `useI18n` composable with ~60 translation keys and parameter interpolation.
- **Spy Chat loading animation**: While feeds load for the first time, an encrypted agent chat (11 randomized dialog pairs in German, Farsi, and English) simulates realistic intelligence communication with typing indicators and timed message bubbles.
- **Spy Chat toast notifications**: During background refreshes (when articles are already visible), agent chat messages appear as compact toast bubbles (max 2 stacked) in the bottom-right corner. On initial load (no articles yet), a simple "Feeds werden geladen… (X s)" counter is shown instead.
- Offline support via Dexie.js (IndexedDB with indexes on `date`, `source`, `[date+source]`).
- Automatic one-time migration from legacy IndexedDB to Dexie.js.
- **HTML Entity Decoding**: Automatic decoding of HTML entities (`&amp;`, `&#8220;`, `&ndash;`, etc.) in both the Worker aggregator and client-side storage — articles display cleanly without raw entity codes.
- **Social Sharing Optimized**: Open Graph and Twitter Card meta tags for rich link previews on WhatsApp, Instagram, Telegram, and X.

## Project Structure

```
news-reader/
├── index.html                 # Vite entry point
├── vite.config.ts             # Vite config (Vue plugin, @/ alias)
├── tsconfig.json              # TypeScript strict mode
├── eslint.config.js           # ESLint flat config (with browser globals)
├── package.json
├── src/
│   ├── main.ts                # App bootstrap (Vue, Pinia, Router, CSS)
│   ├── App.vue                # Root component (layout, startup logic)
│   ├── env.d.ts               # Vite/Vue type declarations
│   ├── router/
│   │   └── index.ts           # Vue Router setup
│   ├── stores/
│   │   ├── articles.ts        # Article state (filtering, sorting, IndexedDB)
│   │   ├── feeds.ts           # Feed fetching (batched, retry, errors)
│   │   └── ui.ts              # UI state (sidebar, toasts, loading)
│   ├── components/
│   │   ├── TopBar.vue         # Header with logo, countdown, refresh, map toggle
│   │   ├── SideBar.vue        # Source navigation, search, disclaimer + GitHub link
│   │   ├── SourceItem.vue     # Individual source in the sidebar
│   │   ├── SidebarOverlay.vue # Mobile overlay
│   │   ├── StatsBar.vue       # Articles/sources/today statistics
│   │   ├── ArticleList.vue    # Article rendering (chronological/grouped)
│   │   ├── ArticleCard.vue    # Single article with locale-aware translate button
│   │   ├── DailySummary.vue   # Collapsible daily summary card (sources, countries, keywords, timeline)
│   │   ├── RicePriceWidget.vue  # Compact rice price card with SVG sparkline (opens dialog)
│   │   ├── RicePriceDialog.vue  # Full modal with Chart.js dual-axis EUR/IRR line chart
│   │   ├── LoadingState.vue   # Loading/empty/offline state
│   │   ├── MapView.vue        # Interactive Leaflet.js world map with country sidebar
│   │   ├── WelcomeModal.vue   # First-visit welcome dialog with typewriter animation
│   │   └── ToastNotification.vue  # Toast system
│   ├── composables/
│   │   ├── useAutoRefresh.ts  # 15-min auto-refresh with countdown
│   │   ├── useDailySummary.ts # Daily statistics (source ranking, countries, keywords, time slots)
│   │   ├── useDexieDB.ts      # Dexie.js storage with indexes, pagination, migration
│   │   ├── useFeedFetcher.ts  # Parallel proxy fetch, ETag cache, aggregator
│   │   ├── useI18n.ts         # i18n system (DE/EN UI) + translationLang (DE/EN/FA) from navigator.language
│   │   ├── useIndexedDB.ts    # Legacy IndexedDB (kept for migration)
│   │   ├── useRicePrice.ts    # Rice price pipeline: Numbeo × Frankfurter × bonbast; singleton state + 24h cache
│   │   └── useTranslation.ts  # Locale-aware translation via Workers AI (source lang → user's lang)
│   ├── config/
│   │   ├── feeds.ts           # 25 feed definitions + SOURCE_LANG map (de/en/fa per feed)
│   │   ├── iranTerms.ts       # 3-tier Iran keywords (HIGH/MEDIUM/LOW, DE/EN/FA)
│   │   ├── constants.ts       # Proxy URLs, DB config, timings, adaptive batching, stopwords
│   │   ├── countries.ts       # 45 countries with multilingual terms + coordinates
│   │   └── spyDialogs.ts      # 11 randomized agent chat dialogs (DE/FA/EN)
│   ├── types/
│   │   ├── article.ts         # Article interface
│   │   ├── feed.ts            # FeedConfig interface
│   │   ├── ricePrice.ts       # RicePricePoint & RicePriceCache interfaces
│   │   └── toast.ts           # Toast interface
│   ├── utils/
│   │   ├── formatters.ts      # Date/time formatting (de-DE)
│   │   ├── helpers.ts         # hashCode, escapeHtml, decodeEntities, isIranRelated
│   │   ├── countryDetector.ts # Article→country matching + stats aggregation
│   │   └── xmlParser.ts       # RSS/Atom XML parsing + Iran filter
│   └── assets/
│       ├── icons/
│       │   └── flags/         # Country flag SVGs (de, us, ir, globe)
│       └── styles/
│           ├── variables.css      # CSS custom properties (dark theme)
│           ├── base.css           # Reset, body, scrollbar
│           ├── layout.css         # Header, sidebar, main, articles, toasts
│           ├── source-colors.css  # Color codes per source (tags + dots)
│           ├── transitions.css    # Vue transition classes
│           └── responsive.css     # Mobile breakpoint (640px)
└── worker/
    ├── worker.js              # Cloudflare Worker (CORS proxy, aggregator, rate-limiting, translation)
    └── wrangler.toml          # Worker configuration
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/slaube86/news-reader.git
cd news-reader
npm install
```

### Development

```bash
npm run dev
# → http://localhost:5173/
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with Hot Module Replacement |
| `npm run build` | TypeScript check + production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint on `src/` |
| `npm run type-check` | TypeScript type check without build |

## Architecture

### Cloudflare Worker (`worker/`)

The app uses a custom Cloudflare Worker as a CORS proxy, feed aggregator, and translation service:

- **RSS Proxy** (`GET /?url=...`): Forwards RSS feed requests with an allowlist (known feed domains only), Cloudflare Cache (5 min TTL), CORS headers, and ETag/Last-Modified passthrough for conditional requests.
- **Feed Aggregator** (`GET /feeds/all`): Fetches all 25 feeds in parallel server-side, parses XML to JSON, decodes HTML entities, filters for Iran-related articles (3-tier scoring: HIGH/MEDIUM/LOW), and returns a single cached response. Reduces client requests from 25 to 1.
- **Translation** (`POST /translate`): Translates article text between German, English, and Farsi via Cloudflare Workers AI (`@cf/meta/m2m100-1.2b`). Accepts a `source` and `target` language code in the request body — both are determined dynamically by the client. Long texts are automatically split into chunks at sentence boundaries.
- **Rate-Limiting**: IP-based throttling (60 requests/minute) to prevent abuse.

### Client (Vue 3 SPA)

- **State Management**: Three Pinia stores (`articles`, `feeds`, `ui`) with clear separation of concerns.
- **Feed Loading**: Tries aggregator endpoint first (1 request for all feeds). Falls back to adaptive batching (batch size 1–8 based on `navigator.connection`) with dynamic inter-batch delays.
- **Iran Relevance Scoring**: 3-tier keyword system (HIGH: direct Iran terms → 1 match sufficient; MEDIUM: Iran-adjacent → 2 matches or 1 MEDIUM + 1 LOW; LOW: generic terms → insufficient alone). Includes opposition/protest terms (Mahsa Amini, Woman Life Freedom, MEK/PMOI, etc.).
- **Locale-Aware Translation**: Each feed is tagged with a content language in `SOURCE_LANG` (`de` | `en` | `fa`). `useI18n` exposes two separate detections from `navigator.language`: `lang` (UI language, `de` | `en`) and `translationLang` (translation target, `de` | `en` | `fa`). `ArticleCard` shows a translate button only when the article's source language differs from `translationLang`, and the button label names the target language explicitly (e.g. "Übersetzen → English"). `useTranslation` passes both the article's source language and the user's target language to the Worker — no language is hardcoded anywhere.
- **HTML Entity Decoding**: `decodeEntities()` in both Worker (`getElText`) and client (`cleanArticle`) ensures all named (`&amp;`, `&ndash;`), numeric (`&#8220;`), and hex (`&#x27;`) entities are decoded, with a second pass to strip any resulting HTML tags.
- **Parallel Proxy Fetching**: `Promise.any()` races primary worker and allorigins fallback — the faster proxy wins.
- **ETag/Last-Modified Cache**: Conditional requests avoid re-downloading unchanged feeds.
- **Storage**: Dexie.js (IndexedDB wrapper) with indexes on `date`, `source`, and compound `[date+source]` for efficient queries and pruning. Auto-migrates from legacy IndexedDB.
- **Pagination**: Infinite scroll with Intersection Observer, loading 50 articles per page.
- **Offline**: Articles are stored via Dexie.js and automatically pruned after 60 days.
- **CSS**: Global CSS (not scoped) with CSS custom properties for a consistent dark theme.

### Deploying the Cloudflare Worker (optional)

The worker is already deployed at `rss-cors-proxy.sebastian-laube.workers.dev`. To deploy it yourself:

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler deploy
```

Then update the worker URL in `src/config/constants.ts` under `PROXY_PRIMARY`.

## Usage

- Select a source in the sidebar (e.g. Iran International or Tagesschau).
- Click "Refresh" / "Aktualisieren" to manually fetch new articles.
- Use the search field for keyword filtering.
- Switch sorting between date and source.
- Click the map button to open the interactive world map showing which countries are mentioned in the news. The sidebar lists countries by article count; click a country for details.
- Articles in a foreign language automatically show a translate button labeled with the target language name (e.g. "Translate → Deutsch" or "Übersetzen → English"). The target language is detected from your browser/OS settings and supports German, English, and Farsi.
- Articles are automatically saved via Dexie.js (available offline).
- The UI language (German/English) is detected automatically from your browser settings.

## Notes

- CORS Proxy: Custom Cloudflare Worker with allowlist as primary proxy, `allorigins.win` as fallback. Both are raced in parallel.
- Feed Aggregator: Worker endpoint `/feeds/all` loads all 25 feeds server-side in one request.
- Translation: Cloudflare Workers AI (free tier: 10,000 neurons/day). Source and target language are fully dynamic — no language pair is hardcoded.
- Rate-Limiting: Worker limits each IP to 60 requests per minute.
- If individual feeds fail, the app displays error details in the sidebar.

## License

This project is open source and can be freely copied, modified, and distributed.