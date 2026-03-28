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
  // --- Farsi dialogs ---
  {
    agents: ['شاهین', 'عقاب'],
    messages: [
      { agent: 'شاهین', text: 'کانال امن برقرار شد. شروع دریافت اطلاعات.' },
      { agent: 'عقاب', text: 'تأیید می‌کنم. منابع فارسی آنلاین هستند. استخراج آغاز شد.' },
      { agent: 'شاهین', text: 'فید بی‌بی‌سی فارسی دریافت شد. سیگنال‌های جدید در حال پردازش.' },
      { agent: 'عقاب', text: 'منابع خبرگزاری مهر رمزگشایی شدند. ترجمه در حال انجام.' },
      { agent: 'شاهین', text: 'داده‌های انتخاب و ایران اینترنشنال دریافت شد.' },
      { agent: 'عقاب', text: 'تحلیل کلیدواژه‌ها تکمیل شد. گزارش نهایی آماده می‌شود…' },
    ],
  },
  {
    agents: ['پلنگ', 'کبرا'],
    messages: [
      { agent: 'پلنگ', text: 'ایستگاه تهران به مرکز. ارتباط برقرار است.' },
      { agent: 'کبرا', text: 'مرکز تأیید می‌کند. سیزده منبع تحت نظارت قرار دارند.' },
      { agent: 'پلنگ', text: 'اولویت با منابع فارسی. مهر نیوز و انتخاب در صدر.' },
      { agent: 'کبرا', text: 'فیدهای فارسی ضبط شدند. ماژول ترجمه فعال شد.' },
      { agent: 'پلنگ', text: 'الجزیره و ایران اینترنشنال اطلاعات ارسال می‌کنند.' },
      { agent: 'کبرا', text: 'آخرین بررسی در جریان است. پرونده تنظیم می‌شود…' },
    ],
  },
  {
    agents: ['ققنوس', 'افعی'],
    messages: [
      { agent: 'ققنوس', text: 'شیفت شبانه آغاز شد. تمام سیستم‌ها عملیاتی هستند.' },
      { agent: 'افعی', text: 'سلام ققنوس. حافظه نهان ساعت ۲۳ پاکسازی شد.' },
      { agent: 'ققنوس', text: 'داده‌های جدید موجود است. بی‌بی‌سی فارسی روی همه فرکانس‌ها.' },
      { agent: 'افعی', text: 'واشنگتن پست و نیویورک تایمز به‌روز شدند. بخش‌های مرتبط استخراج می‌شوند.' },
      { agent: 'ققنوس', text: 'نت‌بلاکس هیچ اختلالی گزارش نکرده. شبکه پایدار است.' },
      { agent: 'افعی', text: 'همه منابع همگام‌سازی شدند. گردآوری نهایی در حال انجام…' },
    ],
  },
  // --- English dialogs ---
  {
    agents: ['HAWK', 'JACKAL'],
    messages: [
      { agent: 'HAWK', text: 'Channel secured. Initiating source reconnaissance.' },
      { agent: 'JACKAL', text: 'Copy that. BBC Persian and Mehr News are online. Extraction underway.' },
      { agent: 'HAWK', text: 'Tagesschau feed intercepted. Processing new signals.' },
      { agent: 'JACKAL', text: 'Persian sources being decoded. Decryption in progress.' },
      { agent: 'HAWK', text: 'Spiegel and ZDF delivering data. Bandwidth stable.' },
      { agent: 'JACKAL', text: 'Iran keyword analysis complete. Compiling briefing…' },
    ],
  },
  {
    agents: ['EAGLE', 'COBRA'],
    messages: [
      { agent: 'EAGLE', text: 'Berlin station to Tehran station. Confirm reception.' },
      { agent: 'COBRA', text: 'Reception confirmed. All sensors active. Ready for transmission.' },
      { agent: 'EAGLE', text: 'Routing data packets from western sources. NYTimes, WashPost acquired.' },
      { agent: 'COBRA', text: 'Packets received. Cross-referencing with local sources.' },
      { agent: 'EAGLE', text: 'NetBlocks reports no disruptions. All channels open.' },
      { agent: 'COBRA', text: 'Data processing at 80%. Classification almost complete.' },
    ],
  },
  {
    agents: ['RAVEN', 'VIPER'],
    messages: [
      { agent: 'RAVEN', text: 'Night shift operational. All systems green.' },
      { agent: 'VIPER', text: 'Good evening, Raven. Flushing 23:00 UTC cache.' },
      { agent: 'RAVEN', text: 'New datasets available. Iran International broadcasting on all frequencies.' },
      { agent: 'VIPER', text: 'Confirmed. Washington Post and NYTimes have updates. Extracting relevant segments.' },
      { agent: 'RAVEN', text: 'NetBlocks Mastodon channel shows no anomalies. Network stable.' },
      { agent: 'VIPER', text: 'All sources synchronized. Preparing final compilation…' },
    ],
  },
  {
    agents: ['PHANTOM', 'SPHINX'],
    messages: [
      { agent: 'PHANTOM', text: 'Division 7 to outpost east. Cryptographic handshake complete.' },
      { agent: 'SPHINX', text: 'Outpost east reports ready. 13 feeds queued for processing.' },
      { agent: 'PHANTOM', text: 'Initiating batch processing. Four simultaneous channels open.' },
      { agent: 'SPHINX', text: 'Chunks being processed. Farsi texts routed through M2M module.' },
      { agent: 'PHANTOM', text: 'Zeit Online and Spiegel report new situation assessments.' },
      { agent: 'SPHINX', text: 'Processing complete. Transmitting results…' },
    ],
  },
]

export function pickRandomDialog(): SpyDialog {
  return SPY_DIALOGS[Math.floor(Math.random() * SPY_DIALOGS.length)]
}
