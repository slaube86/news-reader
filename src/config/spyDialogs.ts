export interface SpyChatMessage {
  agent: string
  text: string
}

export interface SpyDialog {
  agents: [string, string]
  messages: SpyChatMessage[]
}

export const SPY_DIALOGS: SpyDialog[] = [
  {
    agents: ['FALKE', 'SCHAKAL'],
    messages: [
      { agent: 'FALKE', text: 'Kanal gesichert. Beginne Abfrage der Nachrichtenquellen.' },
      { agent: 'SCHAKAL', text: 'Verstanden. BBC Persian und Mehr News sind online. Starte Extraktion.' },
      { agent: 'FALKE', text: 'Tagesschau-Feed abgefangen. Neue Signale werden verarbeitet.' },
      { agent: 'SCHAKAL', text: 'Persische Quellen werden dekodiert. Entschlüsselung läuft.' },
      { agent: 'FALKE', text: 'Spiegel und ZDF liefern Daten. Bandbreite stabil.' },
      { agent: 'SCHAKAL', text: 'Analyse der Iran-Schlüsselwörter abgeschlossen. Briefing wird erstellt…' },
    ],
  },
  {
    agents: ['ADLER', 'KOBRA'],
    messages: [
      { agent: 'ADLER', text: 'Station Berlin an Station Teheran. Empfang bestätigen.' },
      { agent: 'KOBRA', text: 'Empfang bestätigt. Alle Sensoren aktiv. Bereit zur Übertragung.' },
      { agent: 'ADLER', text: 'Leite Datenpakete aus westlichen Quellen weiter. NYTimes, WashPost im Zugriff.' },
      { agent: 'KOBRA', text: 'Pakete empfangen. Starte Abgleich mit lokalen Quellen.' },
      { agent: 'ADLER', text: 'NetBlocks meldet keine Netzstörungen. Alle Kanäle offen.' },
      { agent: 'KOBRA', text: 'Datenaufbereitung bei 80%. Klassifizierung in Kürze abgeschlossen.' },
    ],
  },
  {
    agents: ['PHOENIX', 'SPHINX'],
    messages: [
      { agent: 'PHOENIX', text: 'Operativer Kanal aktiv. Frequenz gesichert.' },
      { agent: 'SPHINX', text: 'Roger. Habe 13 Quellen im Monitoring. Beginne systematische Abfrage.' },
      { agent: 'PHOENIX', text: 'Priorität auf Farsi-Quellen. Entekhab und Mehr News zuerst.' },
      { agent: 'SPHINX', text: 'Farsi-Feeds erfasst. Übersetzungsmodul wird initialisiert.' },
      { agent: 'PHOENIX', text: 'Al Jazeera und Iran International liefern. Verschlüsselung intakt.' },
      { agent: 'SPHINX', text: 'Letzte Validierung läuft. Dossier wird zusammengestellt…' },
    ],
  },
  {
    agents: ['WOLF', 'RABE'],
    messages: [
      { agent: 'WOLF', text: 'Hier Außenstelle. Signalstärke optimal. Beginne Lauschvorgang.' },
      { agent: 'RABE', text: 'Zentrale bestätigt. Proxy-Infrastruktur steht. Leitungen sind sauber.' },
      { agent: 'WOLF', text: 'Erste Feeds aus Tehran empfangen. BBC Persian ist aktiv.' },
      { agent: 'RABE', text: 'Deutsche Quellen werden parallel abgegriffen. Tagesschau, Spiegel, ZDF, Zeit.' },
      { agent: 'WOLF', text: 'Amerikanische Kanäle angebunden. NPR-Verbindung hergestellt.' },
      { agent: 'RABE', text: 'Aggregate stehen. Dekompilierung der Nachrichten beginnt…' },
    ],
  },
  {
    agents: ['CONDOR', 'VIPER'],
    messages: [
      { agent: 'CONDOR', text: 'Nachtschicht übernommen. Alle Systeme operational.' },
      { agent: 'VIPER', text: 'Guten Abend, Condor. Cache von 23:00 UTC wird aufgelöst.' },
      { agent: 'CONDOR', text: 'Neue Datensätze verfügbar. Iran International sendet auf allen Frequenzen.' },
      { agent: 'VIPER', text: 'Bestätigt. Washington Post und NYTimes haben Updates. Extrahiere relevante Segmente.' },
      { agent: 'CONDOR', text: 'Mastodon-Kanal von NetBlocks zeigt keine Anomalien. Netzwerk stabil.' },
      { agent: 'VIPER', text: 'Alle Quellen synchronisiert. Erstelle finale Zusammenstellung…' },
    ],
  },
  {
    agents: ['PANTHER', 'LUCHS'],
    messages: [
      { agent: 'PANTHER', text: 'Abteilung 7 an Posten Ost. Kryptographischer Handshake abgeschlossen.' },
      { agent: 'LUCHS', text: 'Posten Ost meldet Empfangsbereitschaft. 13 Feeds stehen in der Queue.' },
      { agent: 'PANTHER', text: 'Starte Batch-Verarbeitung. Vier simultane Kanäle geöffnet.' },
      { agent: 'LUCHS', text: 'Chunks werden verarbeitet. Persische Texte werden durch M2M-Modul geleitet.' },
      { agent: 'PANTHER', text: 'Zeit Online und Spiegel melden neue Lageberichte.' },
      { agent: 'LUCHS', text: 'Aufbereitung abgeschlossen. Übertragung der Ergebnisse läuft…' },
    ],
  },
  {
    agents: ['GEIER', 'SKORPION'],
    messages: [
      { agent: 'GEIER', text: 'Operative Leitstelle aktiv. HUMINT-Kanäle gesichert.' },
      { agent: 'SKORPION', text: 'Feldbericht: Quellen im Persischen Golf liefern zuverlässig.' },
      { agent: 'GEIER', text: 'ZDF und Tagesschau bestätigen Berichtslage. Korrelation wird geprüft.' },
      { agent: 'SKORPION', text: 'Entekhab-Feed dekodiert. 47 Schlüsselbegriffe werden abgeglichen.' },
      { agent: 'GEIER', text: 'Fallback-Proxy wurde nicht benötigt. Primärkanal stabil.' },
      { agent: 'SKORPION', text: 'Informationsverdichtung läuft. Lagebild wird generiert…' },
    ],
  },
  {
    agents: ['HABICHT', 'MAMBA'],
    messages: [
      { agent: 'HABICHT', text: 'Chiffriermaschine synchronisiert. Kanal Delta-7 steht.' },
      { agent: 'MAMBA', text: 'Eingehende Telemetrie aus 4 Zeitzonen. Beginne Sichtung.' },
      { agent: 'HABICHT', text: 'Mehr News und BBC Persian senden verschlüsselt. Decoder aktiv.' },
      { agent: 'MAMBA', text: 'US-Quellen bestätigen Lageentwicklung. Kreuzreferenz wird erstellt.' },
      { agent: 'HABICHT', text: 'IndexedDB-Archiv wird aktualisiert. Alte Datensätze bereinigt.' },
      { agent: 'MAMBA', text: 'Nachrichtenpool gefüllt. Bereite Übergabe an Analyst vor…' },
    ],
  },
]

export function pickRandomDialog(): SpyDialog {
  return SPY_DIALOGS[Math.floor(Math.random() * SPY_DIALOGS.length)]
}
