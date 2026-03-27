import type { Article } from '@/types/article'
import type { FeedConfig } from '@/types/feed'
import { hashCode, isIranRelated } from '@/utils/helpers'

function getEl(el: Element, tag: string): string {
  const node = el.querySelector(tag)
  if (!node) return ''
  return (node.textContent || node.innerHTML)
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

export function parseRssFeed(xmlString: string, feed: FeedConfig): Article[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  return Array.from(doc.querySelectorAll('item, entry'))
    .map((item) => {
      let title = getEl(item, 'title')
      const desc =
        getEl(item, 'description') ||
        getEl(item, 'summary') ||
        getEl(item, 'content')
      let link = getEl(item, 'link')
      if (!link) {
        const linkNode =
          item.querySelector('link[rel="alternate"]') ||
          item.querySelector('link')
        if (linkNode) {
          link = linkNode.getAttribute('href') || linkNode.textContent || ''
        }
      }
      const date =
        getEl(item, 'pubDate') ||
        getEl(item, 'published') ||
        getEl(item, 'updated')

      if (!title) {
        const plain = desc.replace(/<[^>]+>/g, '').trim()
        title =
          plain
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
            .shift() || `${feed.name} Update`
      }

      const id = `${feed.id}-${Math.abs(hashCode(title + '|' + (link || '')))}`
      return {
        id,
        title,
        desc,
        link,
        date,
        source: feed.id,
        sourceName: feed.name,
      }
    })
    .filter((it) => it.title && isIranRelated(it.title + ' ' + it.desc))
}
