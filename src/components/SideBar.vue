<template>
  <nav class="sidebar" :class="{ active: uiStore.sidebarOpen }">
    <div class="sidebar-section-label">Quellen</div>
    <ul class="src-list">
      <SourceItem source-id="all" label="Alle Quellen" dot-color="#888" />
      <SourceItem source-id="today" label="Heute" dot-color="#f59e0b" />
    </ul>

    <div v-for="group in groups" :key="group.key" class="src-group">
      <button class="src-group-header" @click="toggle(group.key)">
        <span class="src-group-chevron" :class="{ open: openGroups.has(group.key) }">›</span>
        <img :src="group.icon" :alt="group.label" class="src-group-flag">
        <span>{{ group.label }}</span>
        <span class="src-group-count">{{ groupCount(group) }}</span>
      </button>
      <ul v-show="openGroups.has(group.key)" class="src-list src-list--nested">
        <SourceItem
          v-for="feed in group.feeds"
          :key="feed.id"
          :source-id="feed.id"
          :label="feed.label"
          has-refresh
        />
      </ul>
    </div>

    <div class="keyword-section">
      <div class="sidebar-section-label" style="margin-bottom:8px">Suche</div>
      <input
        v-model="articlesStore.searchKeyword"
        class="keyword-input"
        type="text"
        placeholder="Stichwort…"
      >
    </div>
  </nav>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'
import SourceItem from '@/components/SourceItem.vue'
import flagDe from '@/assets/icons/flags/de.svg'
import flagIr from '@/assets/icons/flags/ir.svg'
import flagUs from '@/assets/icons/flags/us.svg'
import flagGlobe from '@/assets/icons/flags/globe.svg'

const articlesStore = useArticlesStore()
const uiStore = useUiStore()

const groups = [
  { key: 'de', label: 'Deutsch', icon: flagDe, feeds: [
    { id: 'tagesschau', label: 'Tagesschau' },
    { id: 'spiegel', label: 'Spiegel' },
    { id: 'zdf', label: 'ZDF' },
    { id: 'zeit', label: 'Zeit Online' },
  ]},
  { key: 'ir', label: 'Persisch', icon: flagIr, feeds: [
    { id: 'iranintl', label: 'Iran International' },
    { id: 'aljazeera', label: 'Al Jazeera' },
    { id: 'mehr', label: 'Mehr News (FA)' },
    { id: 'bbcpersian', label: 'BBC Persian' },
    { id: 'entekhab', label: 'Entekhab (FA)' },
  ]},
  { key: 'us', label: 'Amerikanisch', icon: flagUs, feeds: [
    { id: 'nytimes', label: 'NYTimes' },
    { id: 'washpost', label: 'WashingtonPost' },
    { id: 'npr', label: 'NPR' },
  ]},
  { key: 'other', label: 'Sonstige', icon: flagGlobe, feeds: [
    { id: 'netblocks', label: 'NetBlocks (Mastodon)' },
    { id: 'correctiv', label: 'CORRECTIV' },
    { id: 'bellingcat', label: 'Bellingcat' },
  ]},
]

const openGroups = reactive(new Set<string>())

function toggle(key: string) {
  if (openGroups.has(key)) openGroups.delete(key)
  else openGroups.add(key)
}

function groupCount(group: typeof groups[number]) {
  return group.feeds.reduce((sum, f) => {
    const items = articlesStore.allItems.filter(a => a.source === f.id)
    return sum + items.length
  }, 0)
}
</script>
