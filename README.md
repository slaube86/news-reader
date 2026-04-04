# Iran News Reader

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
| ESLint | 10.1 | Linting (flat config with `eslint-plugin-vue` + `typescript-eslint`) |
| Cloudflare Workers | — | CORS proxy, feed aggregator & Farsi→German translation (Workers AI) |
| Dexie.js | 4.x | IndexedDB wrapper with indexes & typed queries |
| IndexedDB | — | Offline article storage (60 days, via Dexie.js) |

## Features

- Supports 15 sources: Tagesschau, Spiegel, ZDF, Zeit, NYTimes, Washington Post, NPR, NetBlocks, Mehr News (FA), BBC Persian, Iran International, Al Jazeera, Entekhab (FA), CORRECTIV, Bellingcat.
- Filter by source, keyword search, sorting (date/source).
- Auto-refresh every 15 minutes with countdown display.
- Mobile sidebar with slide-in/slide-out, overlay, and auto-close on feed selection.
- Sidebar grouped by language: 🇩🇪 German → 🇮🇷 Persian → 🇺🇸 American → 🌐 Other.
- Sidebar footer with copyright, disclaimer, and GitHub link.
- Translation of Persian articles via Cloudflare Workers AI (m2m100 model).
- **Infinite Scroll Pagination**: Articles load in pages of 50 with automatic loading via Intersection Observer.
- **Daily Summary**: Collapsible card above the article list (visible in "Heute" view) showing top sources, mentioned countries (with flags), trending keywords, and time distribution — all computed client-side.
- **Interactive World Map**: Toggle map view via "🗺️ Karte" button. Displays an interactive Leaflet.js map with circle markers sized by article count per country. 45 countries with multilingual keyword detection (German, English, Farsi). Sidebar shows country list with article counts; clicking a country flies the map to its location and shows a detail panel with source breakdown and article links.
- **Welcome Modal**: First-visit welcome dialog with typewriter animation explaining the project's motivation. Dismissible with "Don't show again" checkbox (persisted in localStorage). Includes GitHub link.
- **Internationalization (i18n)**: All UI texts automatically switch between German and English based on `navigator.language`. Central translation system via `useI18n` composable with ~60 translation keys and parameter interpolation.
- **Spy Chat loading animation**: While feeds load for the first time, an encrypted agent chat (11 randomized dialog pairs in German, Farsi, and English) simulates realistic intelligence communication with typing indicators and timed message bubbles.
- **Spy Chat toast notifications**: During background refreshes (when articles are already visible), agent chat messages appear as compact toast bubbles (max 2 stacked) in the bottom-right corner. On initial load (no articles yet), a simple "Feeds werden geladen… (X s)" counter is shown instead.
- Offline support via Dexie.js (IndexedDB with indexes on `date`, `source`, `[date+source]`).
- Automatic one-time migration from legacy IndexedDB to Dexie.js.

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
│   │   ├── ArticleCard.vue    # Single article with translate button
│   │   ├── DailySummary.vue   # Collapsible daily summary card (sources, countries, keywords, timeline)
│   │   ├── LoadingState.vue   # Loading/empty/offline state
│   │   ├── MapView.vue        # Interactive Leaflet.js world map with country sidebar
│   │   ├── WelcomeModal.vue   # First-visit welcome dialog with typewriter animation
│   │   └── ToastNotification.vue  # Toast system
│   ├── composables/
│   │   ├── useAutoRefresh.ts  # 15-min auto-refresh with countdown
│   │   ├── useDailySummary.ts # Daily statistics (source ranking, countries, keywords, time slots)
│   │   ├── useDexieDB.ts      # Dexie.js storage with indexes, pagination, migration
│   │   ├── useFeedFetcher.ts  # Parallel proxy fetch, ETag cache, aggregator
│   │   ├── useI18n.ts         # i18n system (DE/EN) based on navigator.language
│   │   ├── useIndexedDB.ts    # Legacy IndexedDB (kept for migration)
│   │   └── useTranslation.ts  # Farsi→German via Workers AI
│   ├── config/
│   │   ├── feeds.ts           # 15 feed definitions + Farsi sources
│   │   ├── iranTerms.ts       # 47 Iran keywords (DE/EN/FA)
│   │   ├── constants.ts       # Proxy URLs, DB config, timings, adaptive batching, stopwords
│   │   ├── countries.ts       # 45 countries with multilingual terms + coordinates
│   │   └── spyDialogs.ts     # 11 randomized agent chat dialogs (DE/FA/EN)
│   ├── types/
│   │   ├── article.ts         # Article interface
│   │   ├── feed.ts            # FeedConfig interface
│   │   └── toast.ts           # Toast interface
│   ├── utils/
│   │   ├── formatters.ts      # Date/time formatting (de-DE)
│   │   ├── helpers.ts         # hashCode, escapeHtml, isIranRelated
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
- **Feed Aggregator** (`GET /feeds/all`): Fetches all 15 feeds in parallel server-side, parses XML to JSON, filters for Iran-related articles, and returns a single cached response. Reduces client requests from 15 to 1.
- **Translation** (`POST /translate`): Translates Persian text to German via Cloudflare Workers AI (`@cf/meta/m2m100-1.2b`). Long texts are automatically split into chunks.
- **Rate-Limiting**: IP-based throttling (60 requests/minute) to prevent abuse.

### Client (Vue 3 SPA)

- **State Management**: Three Pinia stores (`articles`, `feeds`, `ui`) with clear separation of concerns.
- **Feed Loading**: Tries aggregator endpoint first (1 request for all feeds). Falls back to adaptive batching (batch size 1–8 based on `navigator.connection`) with dynamic inter-batch delays.
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
- For Persian articles, click "Translate" / "Übersetzen" for automatic translation.
- Articles are automatically saved via Dexie.js (available offline).
- The UI language (German/English) is detected automatically from your browser settings.

## Notes

- CORS Proxy: Custom Cloudflare Worker with allowlist as primary proxy, `allorigins.win` as fallback. Both are raced in parallel.
- Feed Aggregator: Worker endpoint `/feeds/all` loads all feeds server-side in one request.
- Translation: Cloudflare Workers AI (free tier: 10,000 neurons/day).
- Rate-Limiting: Worker limits each IP to 60 requests per minute.
- If individual feeds fail, the app displays error details in the sidebar.

## License

This project is open source and can be freely copied, modified, and distributed.