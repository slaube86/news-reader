# Iran News Reader

Ein leichter, responsiver Web-Reader für Iran-bezogene Nachrichten aus verschiedenen RSS-Feeds. Diese App wurde von Sebastian Laube umgesetzt und lädt Inhalte direkt aus den Quellen; sie speichert keine eigenen Nachrichten, sondern aggregiert und filtert nur vorhandene Feeds.

## Beschreibung

- HTML/CSS/JavaScript Single-Page-App mit lokalem Offline-Cache (IndexedDB).
- Unterstützt mehrere Quellen: Tagesschau, Spiegel, ZDF, Zeit, NYTimes, Washington Post, NPR, NetBlocks, Mehr News (FA), BBC Persian, PressTV, Iran International.
- Filter per Quelle, Stichwortsuche, Sortierung (Datum/Quelle).
- Auto-Refresh alle 15 Minuten und Countdown bis nächster Aktualisierung.
- Mobile Sidebar mit Slide-in/Slide-out, Overlay und automatischem Schließen nach Auswahl.
- Sidebar gruppiert nach Sprache: Deutsch → Persisch → Amerikanisch → Sonstige.
- Übersetzung persischer Artikel via Cloudflare Workers AI (m2m100-Modell).
- Toast-Benachrichtigung für Ladezustand, Erfolg und Fehler.
- Disclaimer: Inhalte stammen aus RSS-Feeds externer Medien.

## Architektur

### Cloudflare Worker (`worker/`)

Die App nutzt einen eigenen Cloudflare Worker als CORS-Proxy und Übersetzungsdienst:

- **RSS-Proxy** (`GET /?url=...`): Leitet RSS-Feed-Requests weiter, mit Allowlist (nur bekannte Feed-Domains), Cloudflare Cache (5 Min TTL) und CORS-Headern.
- **Übersetzung** (`POST /translate`): Übersetzt persische Texte ins Deutsche via Cloudflare Workers AI (`@cf/meta/m2m100-1.2b`). Lange Texte werden automatisch in Chunks aufgeteilt.
- **Fallback**: Wenn der eigene Worker nicht erreichbar ist, fällt die App automatisch auf `allorigins.win` als Backup-Proxy zurück.

### Client (`index.html`)

- Feeds werden in Batches von 4 geladen (500ms Pause dazwischen) statt alle gleichzeitig — reduziert Proxy-Last.
- Exponential Backoff bei Retries (1s → 3s) und 429-Handling mit Retry-After.
- Artikel werden in IndexedDB gespeichert und nach 60 Tagen automatisch bereinigt.

## Einrichten

1. Repository klonen:

```bash
git clone https://github.com/slaube86/news-reader.git
cd news-reader
```

2. Lokales Öffnen (schnellster Weg):
- Datei `index.html` im Browser öffnen.

3. Alternative (lokaler Server):

```bash
python3 -m http.server 8000
# Browser: http://localhost:8000
```

### Cloudflare Worker deployen (optional)

Der Worker ist bereits unter `rss-cors-proxy.sebastian-laube.workers.dev` deployed. Um ihn selbst zu deployen:

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler deploy
```

Danach die Worker-URL in `index.html` bei `PROXY_PRIMARY` anpassen.

## Verwendung

- Quelle in der Seitenleiste wählen (z. B. Iran International oder PressTV).
- Auf `Aktualisieren` klicken, um manuell nach neuen Artikeln zu suchen.
- Suchfeld für Keyword-Filter verwenden.
- Sortierung nach Datum oder Quelle einstellen.
- Bei persischen Artikeln auf „Übersetzen" klicken für eine automatische Übersetzung.
- Gescannte Artikel werden in IndexedDB gespeichert (offline verfügbar).

## Hinweise

- CORS-Proxy: Eigener Cloudflare Worker mit Allowlist als primärer Proxy, `allorigins.win` als Fallback.
- Übersetzung: Cloudflare Workers AI (Free Tier: 10.000 Neurons/Tag).
- Bei Ausfall einzelner Feeds zeigt die App Fehlerdetails in der Sidebar an.

## Lizenz

Dieses Projekt ist Open Source und kann frei kopiert, angepasst und verteilt werden.