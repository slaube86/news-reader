<template>
  <div v-if="articlesStore.filteredItems.length > 0" class="stats-bar">
    <div class="stat-item">
      <span class="stat-val">{{ articlesStore.filteredItems.length }}</span>
      <span class="stat-label">Artikel</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-val">{{ activeSourceCount }}</span>
      <span class="stat-label">Quellen</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-val">{{ articlesStore.todayCount }}</span>
      <span class="stat-label">Heute</span>
    </div>
    <select v-model="articlesStore.sortMode" class="sort-select">
      <option value="date">Neueste zuerst</option>
      <option value="dateAsc">Älteste zuerst</option>
      <option value="source">Nach Quelle</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticlesStore } from '@/stores/articles'

const articlesStore = useArticlesStore()

const activeSourceCount = computed(() => {
  const sources = new Set(articlesStore.filteredItems.map((i) => i.source))
  return sources.size
})
</script>
