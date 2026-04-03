<template>
  <div ref="listContainer">
    <LoadingState
      v-if="articlesStore.filteredItems.length === 0 && uiStore.isLoadingFeeds"
      :loading="true"
    />
    <LoadingState
      v-else-if="articlesStore.filteredItems.length === 0"
      :empty="articlesStore.allItems.length > 0"
      :offline="articlesStore.allItems.length === 0"
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
      <ArticleCard v-for="item in visibleItems" :key="item.id" :article="item" />
      <div v-if="hasMore" ref="sentinel" class="scroll-sentinel">
        <span class="loading-more">Weitere Artikel laden…</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'
import { PAGE_SIZE } from '@/config/constants'
import ArticleCard from '@/components/ArticleCard.vue'
import LoadingState from '@/components/LoadingState.vue'

const articlesStore = useArticlesStore()
const uiStore = useUiStore()

// ── Pagination State ──
const displayCount = ref(PAGE_SIZE)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const visibleItems = computed(() =>
  articlesStore.filteredItems.slice(0, displayCount.value),
)

const hasMore = computed(() =>
  displayCount.value < articlesStore.filteredItems.length,
)

function loadMore() {
  if (hasMore.value) {
    displayCount.value += PAGE_SIZE
  }
}

// Reset bei Filter-/Source-Wechsel
watch(
  () => [articlesStore.currentSource, articlesStore.searchKeyword, articlesStore.sortMode],
  () => {
    displayCount.value = PAGE_SIZE
  },
)

// ── Intersection Observer für Infinite Scroll ──
function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '200px' },
  )
}

watch(sentinel, (el: HTMLElement | null) => {
  if (el && observer) observer.observe(el)
})

onMounted(() => {
  setupObserver()
  nextTick(() => {
    if (sentinel.value && observer) observer.observe(sentinel.value)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

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

<style scoped>
.scroll-sentinel {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.loading-more {
  color: var(--color-text-muted, #888);
  font-size: 0.85rem;
}
</style>
