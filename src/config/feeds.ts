import type { FeedConfig } from "@/types/feed";

export const FEEDS: FeedConfig[] = [
  {
    id: "tagesschau",
    name: "Tagesschau",
    url: "https://www.tagesschau.de/xml/rss2",
  },
  {
    id: "spiegel",
    name: "Spiegel",
    url: "https://www.spiegel.de/schlagzeilen/tops/index.rss",
  },
  {
    id: "zdf",
    name: "ZDF heute",
    url: "https://www.zdf.de/rss/zdf/nachrichten",
  },
  {
    id: "iranintl",
    name: "Iran International",
    url: "https://www.iranintl.com/feed",
  },
  { id: "zeit", name: "Zeit Online", url: "https://newsfeed.zeit.de/all" },
  {
    id: "nytimes",
    name: "NYTimes",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",
  },
  {
    id: "washpost",
    name: "WashingtonPost",
    url: "https://feeds.washingtonpost.com/rss/world",
  },
  { id: "npr", name: "NPR", url: "https://feeds.npr.org/1004/rss.xml" },
  {
    id: "netblocks",
    name: "NetBlocks (Mastodon)",
    url: "https://mastodon.social/@netblocks.rss",
  },
  { id: "mehr", name: "Mehr News (FA)", url: "https://www.mehrnews.com/rss" },
  {
    id: "bbcpersian",
    name: "BBC Persian",
    url: "https://www.bbc.com/persian/index.xml",
  },
  {
    id: "aljazeera",
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
  },
  {
    id: "entekhab",
    name: "Entekhab (FA)",
    url: "https://www.entekhab.ir/fa/rss/allnews",
  },
  { id: "correctiv", name: "CORRECTIV", url: "https://correctiv.org/feed/" },
  {
    id: "bellingcat",
    name: "Bellingcat",
    url: "https://www.bellingcat.com/feed/",
  },
  {
    id: "amnesty",
    name: "Amnesty International",
    url: "https://www.amnesty.de/rss/laender/iran",
  },
  { id: "igfm", name: "IGFM", url: "https://www.igfm.de/feed/" },
  { id: "hrw", name: "Human Rights Watch", url: "https://www.hrw.org/rss" },
  {
    id: "iranhr",
    name: "Iran Human Rights",
    url: "https://iranhr.net/en/rss/",
  },
  {
    id: "radiofarda",
    name: "Radio Farda (FA)",
    url: "https://www.radiofarda.com/api/zrttpol-vomx-tpeoogpi",
  },
  {
    id: "voapersian",
    name: "VOA Persian (FA)",
    url: "https://ir.voanews.com/api/zbtpil-vomx-tpeqiyp",
  },
  { id: "ncri", name: "NCRI", url: "https://www.ncr-iran.org/en/feed/" },
  {
    id: "radiozamaneh",
    name: "Radio Zamaneh (FA)",
    url: "https://www.radiozamaneh.com/feed/",
  },
];

export const FARSI_SOURCES = [
  "bbcpersian",
  "mehr",
  "iranintl",
  "entekhab",
  "radiofarda",
  "voapersian",
  "radiozamaneh",
] as const;

/**
 * Maps every feed ID to its content language.
 * Used by ArticleCard to decide whether a translate button is shown
 * and which source language to pass to the translation API.
 */
export const SOURCE_LANG: Record<string, "de" | "en" | "fa"> = {
  // 🇩🇪 German
  tagesschau: "de",
  spiegel: "de",
  zdf: "de",
  zeit: "de",
  amnesty: "de",
  igfm: "de",
  correctiv: "de",
  // 🇮🇷 Farsi / Persian
  bbcpersian: "fa",
  mehr: "fa",
  iranintl: "fa",
  entekhab: "fa",
  radiofarda: "fa",
  voapersian: "fa",
  radiozamaneh: "fa",
  // 🇺🇸 English
  nytimes: "en",
  washpost: "en",
  npr: "en",
  netblocks: "en",
  aljazeera: "en",
  bellingcat: "en",
  hrw: "en",
  iranhr: "en",
  ncri: "en",
};
