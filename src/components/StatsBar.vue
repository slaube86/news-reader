<template>
  <div v-if="articlesStore.filteredItems.length > 0" class="stats-bar">
    <div class="stat-item">
      <span class="stat-val">{{ articlesStore.filteredItems.length }}</span>
      <span class="stat-label">{{ t('stats.articles') }}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-val">{{ activeSourceCount }}</span>
      <span class="stat-label">{{ t('stats.sources') }}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-val">{{ articlesStore.todayCount }}</span>
      <span class="stat-label">{{ t('stats.today') }}</span>
    </div>
    <select v-model="articlesStore.sortMode" class="sort-select">
      <option value="date">{{ t('stats.sortNewest') }}</option>
      <option value="dateAsc">{{ t('stats.sortOldest') }}</option>
      <option value="source">{{ t('stats.sortSource') }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticlesStore } from '@/stores/articles'
import { useI18n } from '@/composables/useI18n'

const articlesStore = useArticlesStore()
const { t } = useI18n()

const activeSourceCount = computed(() => {
  const sources = new Set(articlesStore.filteredItems.map((i) => i.source))
  return sources.size
})
</script>
