<template>
  <nav class="sidebar" :class="{ active: uiStore.sidebarOpen }">
    <div class="sidebar-section-label">{{ t('sidebar.sources') }}</div>
    <ul class="src-list">
      <SourceItem source-id="all" :label="t('sidebar.allSources')" dot-color="#888" />
      <SourceItem source-id="today" :label="t('sidebar.today')" dot-color="#f59e0b" />
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
      <div class="sidebar-section-label" style="margin-bottom:8px">{{ t('sidebar.search') }}</div>
      <input
        v-model="articlesStore.searchKeyword"
        class="keyword-input"
        type="text"
        :placeholder="t('sidebar.placeholder')"
      >
    </div>

    <div class="sidebar-disclaimer">
      <p>&copy; 2026 Sebastian Laube – <a href="https://www.seblaube.de/about" target="_blank" rel="noopener">www.seblaube.de/about</a></p>
      <p>{{ t('sidebar.disclaimer') }}</p>
      <p><a href="https://github.com/slaube86/news-reader" target="_blank" rel="noopener">GitHub</a></p>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/composables/useI18n'
import SourceItem from '@/components/SourceItem.vue'
import flagDe from '@/assets/icons/flags/de.svg'
import flagIr from '@/assets/icons/flags/ir.svg'
import flagUs from '@/assets/icons/flags/us.svg'
import flagGlobe from '@/assets/icons/flags/globe.svg'

const articlesStore = useArticlesStore()
const uiStore = useUiStore()
const { t } = useI18n()

// Mobile: Sidebar automatisch schließen bei Feed-Wechsel
watch(() => articlesStore.currentSource, () => {
  if (window.innerWidth <= 640) {
    uiStore.toggleSidebar(false)
  }
})

const groups = [
  { key: 'de', label: t('sidebar.groupDe'), icon: flagDe, feeds: [
    { id: 'tagesschau', label: 'Tagesschau' },
    { id: 'spiegel', label: 'Spiegel' },
    { id: 'zdf', label: 'ZDF' },
    { id: 'zeit', label: 'Zeit Online' },
  ]},
  { key: 'ir', label: t('sidebar.groupIr'), icon: flagIr, feeds: [
    { id: 'iranintl', label: 'Iran International' },
    { id: 'aljazeera', label: 'Al Jazeera' },
    { id: 'mehr', label: 'Mehr News (FA)' },
    { id: 'bbcpersian', label: 'BBC Persian' },
    { id: 'entekhab', label: 'Entekhab (FA)' },
    { id: 'radiofarda', label: 'Radio Farda (FA)' },
    { id: 'voapersian', label: 'VOA Persian (FA)' },
    { id: 'ncri', label: 'NCRI' },
    { id: 'radiozamaneh', label: 'Radio Zamaneh (FA)' },
  ]},
  { key: 'us', label: t('sidebar.groupUs'), icon: flagUs, feeds: [
    { id: 'nytimes', label: 'NYTimes' },
    { id: 'washpost', label: 'WashingtonPost' },
    { id: 'npr', label: 'NPR' },
  ]},
  { key: 'hr', label: t('sidebar.groupHR'), icon: flagGlobe, feeds: [
    { id: 'amnesty', label: 'Amnesty International' },
    { id: 'igfm', label: 'IGFM' },
    { id: 'hrw', label: 'Human Rights Watch' },
    { id: 'iranhr', label: 'Iran Human Rights' },
  ]},
  { key: 'other', label: t('sidebar.groupOther'), icon: flagGlobe, feeds: [
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
