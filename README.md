# Iran News Reader

Ein leichter, responsiver Web-Reader für Iran-bezogene Nachrichten aus verschiedenen RSS-Feeds. Diese App wurde von Sebastian Laube umgesetzt und lädt Inhalte direkt aus den Quellen; sie speichert keine eigenen Nachrichten, sondern aggregiert und filtert nur vorhandene Feeds.

## Tech-Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Vue 3 | 3.5 | UI-Framework (Composition API, `<script setup>`) |
| Vite | 8.0 | Dev-Server & Build-Tool |
| Pinia | 3.0 | State Management |
| Vue Router | 4.6 | Routing (vorbereitet für spätere Erweiterung) |
| TypeScript | 5.9 | Typsicherheit |
| ESLint | 10.1 | Linting (Flat Config mit `eslint-plugin-vue` + `typescript-eslint`) |
| Cloudflare Workers | — | CORS-Proxy & Farsi→Deutsch Übersetzung (Workers AI) |
| IndexedDB | — | Offline-Speicherung der Artikel (60 Tage) |

## Features

- Unterstützt 13 Quellen: Tagesschau, Spiegel, ZDF, Zeit, NYTimes, Washington Post, NPR, NetBlocks, Mehr News (FA), BBC Persian, Iran International, Al Jazeera, Entekhab (FA).
- Filter per Quelle, Stichwortsuche, Sortierung (Datum/Quelle).
- Auto-Refresh alle 15 Minuten mit Countdown-Anzeige.
- Mobile Sidebar mit Slide-in/Slide-out, Overlay und automatischem Schließen.
- Sidebar gruppiert nach Sprache: 🇩🇪 Deutsch → 🇮🇷 Persisch → 🇺🇸 Amerikanisch → 🌐 Sonstige.
- Übersetzung persischer Artikel via Cloudflare Workers AI (m2m100-Modell).
- Toast-Benachrichtigungen für Ladezustand, Erfolg und Fehler.
- Offline-Unterstützung über IndexedDB.

## Projektstruktur

```
news-reader/
├── index.html                 # Vite Entry Point
├── vite.config.ts             # Vite-Konfiguration (Vue-Plugin, @/-Alias)
├── tsconfig.json              # TypeScript strict mode
├── eslint.config.js           # ESLint Flat Config
├── package.json
├── src/
│   ├── main.ts                # App-Bootstrap (Vue, Pinia, Router, CSS)
│   ├── App.vue                # Root-Komponente (Layout, Startup-Logik)
│   ├── env.d.ts               # Vite/Vue Typ-Deklarationen
│   ├── router/
│   │   └── index.ts           # Vue Router Setup
│   ├── stores/
│   │   ├── articles.ts        # Artikel-State (Filter, Sortierung, IndexedDB)
│   │   ├── feeds.ts           # Feed-Fetching (Batched, Retry, Fehler)
│   │   └── ui.ts              # UI-State (Sidebar, Toasts, Loading)
│   ├── components/
│   │   ├── TopBar.vue         # Header mit Logo, Countdown, Refresh
│   │   ├── SideBar.vue        # Quellen-Navigation + Suche
│   │   ├── SourceItem.vue     # Einzelne Quelle in der Sidebar
│   │   ├── SidebarOverlay.vue # Mobile Overlay
│   │   ├── StatsBar.vue       # Artikel/Quellen/Heute Statistiken
│   │   ├── ArticleList.vue    # Artikel-Rendering (chronologisch/gruppiert)
│   │   ├── ArticleCard.vue    # Einzelner Artikel mit Übersetzen-Button
│   │   ├── LoadingState.vue   # Lade-/Leer-/Offline-Zustand
│   │   └── ToastNotification.vue  # Toast-System
│   ├── composables/
│   │   ├── useAutoRefresh.ts  # 15-Min Auto-Refresh mit Countdown
│   │   ├── useFeedFetcher.ts  # HTTP-Fetch mit Retry, Backoff, Fallback-Proxy
│   │   ├── useIndexedDB.ts    # IndexedDB CRUD + Pruning
│   │   └── useTranslation.ts  # Farsi→Deutsch via Workers AI
│   ├── config/
│   │   ├── feeds.ts           # 13 Feed-Definitionen + Farsi-Quellen
│   │   ├── iranTerms.ts       # 47 Iran-Keywords (DE/EN/FA)
│   │   └── constants.ts       # Proxy-URLs, DB-Config, Timings
│   ├── types/
│   │   ├── article.ts         # Article Interface
│   │   ├── feed.ts            # FeedConfig Interface
│   │   └── toast.ts           # Toast Interface
│   ├── utils/
│   │   ├── formatters.ts      # Datum/Zeit-Formatierung (de-DE)
│   │   ├── helpers.ts         # hashCode, escapeHtml, isIranRelated
│   │   └── xmlParser.ts       # RSS/Atom XML-Parsing + Iran-Filter
│   └── assets/
│       └── styles/
│           ├── variables.css      # CSS Custom Properties (Dark Theme)
│           ├── base.css           # Reset, Body, Scrollbar
│           ├── layout.css         # Header, Sidebar, Main, Articles, Toasts
│           ├── source-colors.css  # Farbcodes pro Quelle (Tags + Dots)
│           ├── transitions.css    # Vue Transition-Klassen
│           └── responsive.css     # Mobile Breakpoint (640px)
└── worker/
    ├── worker.js              # Cloudflare Worker (CORS-Proxy + Übersetzung)
    └── wrangler.toml          # Worker-Konfiguration
```

## Einrichten

### Voraussetzungen

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

### Weitere Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `npm run dev` | Vite Dev-Server mit Hot Module Replacement |
| `npm run build` | TypeScript-Check + Produktions-Build nach `dist/` |
| `npm run preview` | Build-Vorschau lokal servieren |
| `npm run lint` | ESLint über `src/` ausführen |
| `npm run type-check` | TypeScript-Typprüfung ohne Build |

## Architektur

### Cloudflare Worker (`worker/`)

Die App nutzt einen eigenen Cloudflare Worker als CORS-Proxy und Übersetzungsdienst:

- **RSS-Proxy** (`GET /?url=...`): Leitet RSS-Feed-Requests weiter, mit Allowlist (nur bekannte Feed-Domains), Cloudflare Cache (5 Min TTL) und CORS-Headern.
- **Übersetzung** (`POST /translate`): Übersetzt persische Texte ins Deutsche via Cloudflare Workers AI (`@cf/meta/m2m100-1.2b`). Lange Texte werden automatisch in Chunks aufgeteilt.
- **Fallback**: Wenn der eigene Worker nicht erreichbar ist, fällt die App automatisch auf `allorigins.win` als Backup-Proxy zurück.

### Client (Vue 3 SPA)

- **State Management**: Drei Pinia Stores (`articles`, `feeds`, `ui`) mit klarer Trennung.
- **Feed-Loading**: Feeds werden in Batches von 4 geladen (500 ms Pause) — reduziert Proxy-Last.
- **Retry-Logik**: Exponential Backoff (1 s → 3 s) und 429-Handling mit Retry-After.
- **Offline**: Artikel werden in IndexedDB gespeichert und nach 60 Tagen automatisch bereinigt.
- **CSS**: Globales CSS (kein Scoped) mit CSS Custom Properties für ein durchgängiges Dark Theme.

### Cloudflare Worker deployen (optional)

Der Worker ist bereits unter `rss-cors-proxy.sebastian-laube.workers.dev` deployed. Um ihn selbst zu deployen:

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler deploy
```

Danach die Worker-URL in `src/config/constants.ts` bei `PROXY_PRIMARY` anpassen.

## Verwendung

- Quelle in der Seitenleiste wählen (z. B. Iran International oder Tagesschau).
- Auf `Aktualisieren` klicken, um manuell nach neuen Artikeln zu suchen.
- Suchfeld für Keyword-Filter verwenden.
- Sortierung nach Datum oder Quelle einstellen.
- Bei persischen Artikeln auf „Übersetzen" klicken für eine automatische Übersetzung.
- Artikel werden automatisch in IndexedDB gespeichert (offline verfügbar).

## Hinweise

- CORS-Proxy: Eigener Cloudflare Worker mit Allowlist als primärer Proxy, `allorigins.win` als Fallback.
- Übersetzung: Cloudflare Workers AI (Free Tier: 10.000 Neurons/Tag).
- Bei Ausfall einzelner Feeds zeigt die App Fehlerdetails in der Sidebar an.

## Lizenz

Dieses Projekt ist Open Source und kann frei kopiert, angepasst und verteilt werden.