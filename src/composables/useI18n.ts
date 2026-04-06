import { reactive } from 'vue'

const messages: Record<string, Record<string, string>> = {
  de: {
    // TopBar
    'topbar.logo': 'Iran News Reader',
    'topbar.sources': 'Quellen',
    'topbar.map': 'Karte',
    'topbar.refresh': 'Aktualisieren',

    // SideBar
    'sidebar.sources': 'Quellen',
    'sidebar.allSources': 'Alle Quellen',
    'sidebar.today': 'Heute',
    'sidebar.search': 'Suche',
    'sidebar.placeholder': 'Stichwort…',
    'sidebar.copyright': '© 2026 Sebastian Laube',
    'sidebar.disclaimer':
      'Inhalte werden über aggregierte RSS-Feeds geladen; sie stammen nicht von mir und unterliegen den jeweiligen Medienquellen.',
    'sidebar.groupDe': 'Deutsch',
    'sidebar.groupIr': 'Persisch',
    'sidebar.groupUs': 'Amerikanisch',
    'sidebar.groupHR': 'Menschenrechte',
    'sidebar.groupOther': 'Sonstige',

    // StatsBar
    'stats.articles': 'Artikel',
    'stats.sources': 'Quellen',
    'stats.today': 'Heute',
    'stats.sortNewest': 'Neueste zuerst',
    'stats.sortOldest': 'Älteste zuerst',
    'stats.sortSource': 'Nach Quelle',

    // ArticleList
    'list.articles': 'Artikel',
    'list.loadMore': 'Weitere Artikel laden…',

    // ArticleCard
    'card.translate': 'Übersetzen',
    'card.translating': 'Übersetzung wird geladen...',
    'card.translationFailed': 'Übersetzung fehlgeschlagen',

    // DailySummary
    'summary.title': 'Daily Recap',
    'summary.articles': 'Artikel',
    'summary.sources': 'Quellen',
    'summary.topSources': 'Top-Quellen',
    'summary.countries': 'Erwähnte Länder',
    'summary.trending': 'Trending',
    'summary.timeline': 'Zeitverlauf',

    // LoadingState
    'loading.feeds': 'Feeds werden geladen…',
    'loading.noArticles': 'Keine Artikel gefunden',
    'loading.tryAgain': 'Versuche es erneut oder ändere den Filter',
    'loading.offline': 'Keine Verbindung zu den Feeds',
    'loading.checkConnection': 'Internetverbindung prüfen und erneut versuchen',

    // MapView
    'map.countries': 'Länder',
    'map.allCountries': 'Alle Länder',
    'map.articles': 'Artikel',
    'map.andMore': '… und {n} weitere',

    // SourceItem
    'source.refresh': '{name} aktualisieren',

    // useAutoRefresh
    'refresh.next': 'nächstes Update in: ',

    // useDailySummary
    'time.night': 'Nacht',
    'time.morning': 'Morgen',
    'time.noon': 'Mittag',
    'time.evening': 'Abend',

    // feeds store
    'feeds.noIranArticles': 'Keine passenden Iran-Artikel gefunden',
    'feeds.updated': '{name} aktualisiert ({n} Artikel)',
    'feeds.allUpdated': 'Alle Quellen wurden aktualisiert',
    'feeds.allUpdatedAggregator': 'Alle Quellen wurden aktualisiert (Aggregator)',
    'feeds.loadError': 'Konnte nicht laden: {detail}. CORS-Proxy kann zeitweise überlastet sein.',
    'feeds.offlineLoaded': 'Offline-Modus: Artikel aus Datenbank geladen',
    'feeds.noConnection': 'Keine Verbindung zu den Feeds',

    // ui store
    'ui.loadingFeeds': 'Feeds werden geladen… ({n} s)',

    // WelcomeModal
    'welcome.title': 'Hi, schön dass du da bist.',
    'welcome.body': `Ich habe dieses Projekt gestartet, weil mich die Lage im Iran persönlich betrifft. Meine Frau ist Perserin, wir haben einen kleinen Sohn – und ihre Eltern leben im Iran. Ich wollte informiert bleiben, ohne jeden Tag zehn verschiedene Seiten durchzuklicken.\n\nDeshalb habe ich diesen News Reader gebaut: Viele Quellen an einem Ort. Deutsche, persische und internationale Medien – alles offizielle Nachrichtenseiten, direkt per RSS geladen, ohne Tracking, ohne Algorithmen.\n\nIch hoffe, dieser News Reader kann auch dir helfen, up to date zu bleiben – und lass uns hoffen, dass wir ihn bald nicht mehr brauchen!\n\n— Sebastian Laube`,
    'welcome.github': 'Das Projekt ist Open Source und auf',
    'welcome.githubSuffix': 'verfügbar.',
    'welcome.dontShow': 'Nicht mehr anzeigen',
    'welcome.ok': 'Verstanden',
  },
  en: {
    // TopBar
    'topbar.logo': 'Iran News Reader',
    'topbar.sources': 'Sources',
    'topbar.map': 'Map',
    'topbar.refresh': 'Refresh',

    // SideBar
    'sidebar.sources': 'Sources',
    'sidebar.allSources': 'All Sources',
    'sidebar.today': 'Today',
    'sidebar.search': 'Search',
    'sidebar.placeholder': 'Keyword…',
    'sidebar.copyright': '© 2026 Sebastian Laube',
    'sidebar.disclaimer':
      'Content is loaded via aggregated RSS feeds; it does not originate from me and is subject to the respective media sources.',
    'sidebar.groupDe': 'German',
    'sidebar.groupIr': 'Persian',
    'sidebar.groupUs': 'American',
    'sidebar.groupHR': 'Human Rights',
    'sidebar.groupOther': 'Other',

    // StatsBar
    'stats.articles': 'Articles',
    'stats.sources': 'Sources',
    'stats.today': 'Today',
    'stats.sortNewest': 'Newest first',
    'stats.sortOldest': 'Oldest first',
    'stats.sortSource': 'By source',

    // ArticleList
    'list.articles': 'Articles',
    'list.loadMore': 'Load more articles…',

    // ArticleCard
    'card.translate': 'Translate',
    'card.translating': 'Translating…',
    'card.translationFailed': 'Translation failed',

    // DailySummary
    'summary.title': 'Daily Recap',
    'summary.articles': 'Articles',
    'summary.sources': 'Sources',
    'summary.topSources': 'Top Sources',
    'summary.countries': 'Mentioned Countries',
    'summary.trending': 'Trending',
    'summary.timeline': 'Timeline',

    // LoadingState
    'loading.feeds': 'Loading feeds…',
    'loading.noArticles': 'No articles found',
    'loading.tryAgain': 'Try again or change the filter',
    'loading.offline': 'No connection to feeds',
    'loading.checkConnection': 'Check your internet connection and try again',

    // MapView
    'map.countries': 'Countries',
    'map.allCountries': 'All Countries',
    'map.articles': 'Articles',
    'map.andMore': '… and {n} more',

    // SourceItem
    'source.refresh': 'Refresh {name}',

    // useAutoRefresh
    'refresh.next': 'next update in: ',

    // useDailySummary
    'time.night': 'Night',
    'time.morning': 'Morning',
    'time.noon': 'Afternoon',
    'time.evening': 'Evening',

    // feeds store
    'feeds.noIranArticles': 'No matching Iran articles found',
    'feeds.updated': '{name} updated ({n} articles)',
    'feeds.allUpdated': 'All sources updated',
    'feeds.allUpdatedAggregator': 'All sources updated (Aggregator)',
    'feeds.loadError': 'Could not load: {detail}. CORS proxy may be temporarily overloaded.',
    'feeds.offlineLoaded': 'Offline mode: articles loaded from database',
    'feeds.noConnection': 'No connection to feeds',

    // ui store
    'ui.loadingFeeds': 'Loading feeds… ({n} s)',

    // WelcomeModal
    'welcome.title': "Hi, glad you're here.",
    'welcome.body': `I started this project because the situation in Iran affects me personally. My wife is Persian, we have a little son – and her parents live in Iran. I wanted to stay informed without clicking through ten different websites every day.\n\nThat's why I built this news reader: many sources in one place. German, Persian and international media – all official news sites, loaded directly via RSS, no tracking, no algorithms.\n\nI hope this news reader can help you stay up to date too – and let's hope we won't need it much longer!\n\n— Sebastian Laube`,
    'welcome.github': 'The project is open source and available on',
    'welcome.githubSuffix': '.',
    'welcome.dontShow': "Don't show again",
    'welcome.ok': 'Got it',
  },
}

function detectLang(): 'de' | 'en' {
  const lang = navigator.language?.split('-')[0] ?? 'en'
  return lang === 'de' ? 'de' : 'en'
}

const currentLang = detectLang()

function t(key: string, params?: Record<string, string | number>): string {
  let msg = messages[currentLang]?.[key] ?? messages.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      msg = msg.replaceAll(`{${k}}`, String(v))
    }
  }
  return msg
}

export function useI18n() {
  return { t, lang: currentLang }
}
