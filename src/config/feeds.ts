import type { FeedConfig } from '@/types/feed'

export const FEEDS: FeedConfig[] = [
  { id: 'tagesschau', name: 'Tagesschau', url: 'https://www.tagesschau.de/xml/rss2' },
  { id: 'spiegel', name: 'Spiegel', url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss' },
  { id: 'zdf', name: 'ZDF heute', url: 'https://www.zdf.de/rss/zdf/nachrichten' },
  { id: 'iranintl', name: 'Iran International', url: 'https://www.iranintl.com/feed' },
  { id: 'zeit', name: 'Zeit Online', url: 'https://newsfeed.zeit.de/all' },
  { id: 'nytimes', name: 'NYTimes', url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml' },
  { id: 'washpost', name: 'WashingtonPost', url: 'https://feeds.washingtonpost.com/rss/world' },
  { id: 'npr', name: 'NPR', url: 'https://feeds.npr.org/1004/rss.xml' },
  { id: 'netblocks', name: 'NetBlocks (Mastodon)', url: 'https://mastodon.social/@netblocks.rss' },
  { id: 'mehr', name: 'Mehr News (FA)', url: 'https://www.mehrnews.com/rss' },
  { id: 'bbcpersian', name: 'BBC Persian', url: 'https://www.bbc.com/persian/index.xml' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'entekhab', name: 'Entekhab (FA)', url: 'https://www.entekhab.ir/fa/rss/allnews' },
]

export const FARSI_SOURCES = ['bbcpersian', 'mehr', 'iranintl', 'entekhab'] as const
