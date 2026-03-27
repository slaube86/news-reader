<template>
  <div>
    <LoadingState
      v-if="articlesStore.filteredItems.length === 0"
      :loading="uiStore.isLoadingFeeds"
      :empty="!uiStore.isLoadingFeeds && articlesStore.allItems.length > 0"
      :offline="!uiStore.isLoadingFeeds && articlesStore.allItems.length === 0"
    />

    <template v-else-if="articlesStore.sortMode === 'source'">
      <div v-for="group in groupedBySource" :key="group.source" class="feed-block">
        <div class="feed-header">
          <span class="feed-name">{{ group.name }}</span>
          <span class="feed-count">{{ group.items.length }} Artikel</span>
        </div>
        <ArticleCard v-for="item in group.items" :key="item.id" :article="item" />
      </div>
    </template>

    <div v-else class="feed-block">
      <ArticleCard v-for="item in articlesStore.filteredItems" :key="item.id" :article="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'
import ArticleCard from '@/components/ArticleCard.vue'
import LoadingState from '@/components/LoadingState.vue'

const articlesStore = useArticlesStore()
const uiStore = useUiStore()

interface SourceGroup {
  source: string
  name: string
  items: typeof articlesStore.filteredItems
}

const groupedBySource = computed<SourceGroup[]>(() => {
  const map: Record<string, SourceGroup> = {}
  articlesStore.filteredItems.forEach((item) => {
    if (!map[item.source]) {
      map[item.source] = { source: item.source, name: item.sourceName, items: [] }
    }
    map[item.source].items.push(item)
  })
  return Object.values(map)
})
</script>
