# Iran News Reader

Ein leichter, responsiver Web-Reader für Iran-bezogene Nachrichten aus verschiedenen RSS-Feeds. Diese App wurde von Sebastian Laube umgesetzt und lädt Inhalte direkt aus den Quellen; sie speichert keine eigenen Nachrichten, sondern aggregiert und filtert nur vorhandene Feeds.

## Beschreibung

- HTML/CSS/JavaScript Single-Page-App mit lokalem Offline-Cache (IndexedDB).
- Unterstützt mehrere Quellen, inklusive Tagesschau, Spiegel, ZDF, Zeit, NYTimes, Washington Post, CNN, NPR, NetBlocks, Mehr News (FA), BBC Persian, PressTV, Iran International.
- Filter per Quelle, Stichwortsuche, Sortierung (Datum/Quelle).
- Auto-Refresh alle 10 Minuten und Countdown bis nächster Aktualisierung.
- Mobile Sidebar mit Slide-in/Slide-out, Overlay und automatischem Schließen nach Auswahl.
- Toast-Benachrichtigung für Ladezustand, Erfolg und Fehler.
- Disclaimer: Inhalte stammen aus RSS-Feeds externer Medien.

## Einrichten

1. Repository klonen:

```bash
git clone https://github.com/slaube86/news-reader.git
cd news-reader
```

2. Lokales Opening (schnellster Weg):
- Datei `index.html` im Browser öffnen.

3. Alternative (lokaler Server):

```bash
# Python 3.x
python3 -m http.server 8000
# Browser: http://localhost:8000
```

## Verwendung

- Quelle in der Seitenleiste wählen (z. B. Iran International oder PressTV).
- Auf `Aktualisieren` klicken, um manuell nach neuen Artikeln zu suchen.
- Suchfeld für Keyword-Filter verwenden.
- Sortierung nach Datum oder Quelle einstellen.
- Gescannte Artikel werden in IndexedDB gespeichert (offline verfügbar).

## Hinweise

- CORS-Proxy: API verwendet `https://api.allorigins.win/raw?url=` für RSS-Zugriff.
- Bei Ausfall einzelner Feeds zeigt die App Fehlerdetails in der Sidebar an.

## Lizenz

Dieses Projekt ist Open Source und kann frei kopiert, angepasst und verteilt werden.