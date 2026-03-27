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
| ESLint | 10.1 | Linting (flat config with `eslint-plugin-vue` + `typescript-eslint`) |
| Cloudflare Workers | — | CORS proxy & Farsi→German translation (Workers AI) |
| IndexedDB | — | Offline article storage (60 days) |

## Features

- Supports 13 sources: Tagesschau, Spiegel, ZDF, Zeit, NYTimes, Washington Post, NPR, NetBlocks, Mehr News (FA), BBC Persian, Iran International, Al Jazeera, Entekhab (FA).
- Filter by source, keyword search, sorting (date/source).
- Auto-refresh every 15 minutes with countdown display.
- Mobile sidebar with slide-in/slide-out, overlay, and auto-close.
- Sidebar grouped by language: 🇩🇪 German → 🇮🇷 Persian → 🇺🇸 American → 🌐 Other.
- Translation of Persian articles via Cloudflare Workers AI (m2m100 model).
- Toast notifications for loading state, success, and errors.
- Offline support via IndexedDB.

## Project Structure

```
news-reader/
├── index.html                 # Vite entry point
├── vite.config.ts             # Vite config (Vue plugin, @/ alias)
├── tsconfig.json              # TypeScript strict mode
├── eslint.config.js           # ESLint flat config
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
│   │   ├── TopBar.vue         # Header with logo, countdown, refresh
│   │   ├── SideBar.vue        # Source navigation + search
│   │   ├── SourceItem.vue     # Individual source in the sidebar
│   │   ├── SidebarOverlay.vue # Mobile overlay
│   │   ├── StatsBar.vue       # Articles/sources/today statistics
│   │   ├── ArticleList.vue    # Article rendering (chronological/grouped)
│   │   ├── ArticleCard.vue    # Single article with translate button
│   │   ├── LoadingState.vue   # Loading/empty/offline state
│   │   └── ToastNotification.vue  # Toast system
│   ├── composables/
│   │   ├── useAutoRefresh.ts  # 15-min auto-refresh with countdown
│   │   ├── useFeedFetcher.ts  # HTTP fetch with retry, backoff, fallback proxy
│   │   ├── useIndexedDB.ts    # IndexedDB CRUD + pruning
│   │   └── useTranslation.ts  # Farsi→German via Workers AI
│   ├── config/
│   │   ├── feeds.ts           # 13 feed definitions + Farsi sources
│   │   ├── iranTerms.ts       # 47 Iran keywords (DE/EN/FA)
│   │   └── constants.ts       # Proxy URLs, DB config, timings
│   ├── types/
│   │   ├── article.ts         # Article interface
│   │   ├── feed.ts            # FeedConfig interface
│   │   └── toast.ts           # Toast interface
│   ├── utils/
│   │   ├── formatters.ts      # Date/time formatting (de-DE)
│   │   ├── helpers.ts         # hashCode, escapeHtml, isIranRelated
│   │   └── xmlParser.ts       # RSS/Atom XML parsing + Iran filter
│   └── assets/
│       └── styles/
│           ├── variables.css      # CSS custom properties (dark theme)
│           ├── base.css           # Reset, body, scrollbar
│           ├── layout.css         # Header, sidebar, main, articles, toasts
│           ├── source-colors.css  # Color codes per source (tags + dots)
│           ├── transitions.css    # Vue transition classes
│           └── responsive.css     # Mobile breakpoint (640px)
└── worker/
    ├── worker.js              # Cloudflare Worker (CORS proxy + translation)
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

The app uses a custom Cloudflare Worker as a CORS proxy and translation service:

- **RSS Proxy** (`GET /?url=...`): Forwards RSS feed requests with an allowlist (known feed domains only), Cloudflare Cache (5 min TTL), and CORS headers.
- **Translation** (`POST /translate`): Translates Persian text to German via Cloudflare Workers AI (`@cf/meta/m2m100-1.2b`). Long texts are automatically split into chunks.
- **Fallback**: If the custom worker is unavailable, the app automatically falls back to `allorigins.win` as a backup proxy.

### Client (Vue 3 SPA)

- **State Management**: Three Pinia stores (`articles`, `feeds`, `ui`) with clear separation of concerns.
- **Feed Loading**: Feeds are loaded in batches of 4 (500 ms pause between batches) to reduce proxy load.
- **Retry Logic**: Exponential backoff (1 s → 3 s) and 429 handling with Retry-After.
- **Offline**: Articles are stored in IndexedDB and automatically pruned after 60 days.
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
- Click `Aktualisieren` (Refresh) to manually fetch new articles.
- Use the search field for keyword filtering.
- Switch sorting between date and source.
- For Persian articles, click "Übersetzen" (Translate) for automatic translation.
- Articles are automatically saved to IndexedDB (available offline).

## Notes

- CORS Proxy: Custom Cloudflare Worker with allowlist as primary proxy, `allorigins.win` as fallback.
- Translation: Cloudflare Workers AI (free tier: 10,000 neurons/day).
- If individual feeds fail, the app displays error details in the sidebar.

## License

This project is open source and can be freely copied, modified, and distributed.