<template>
  <li
    class="src-item"
    :class="{ active: isActive }"
    @click="articlesStore.setCurrentSource(sourceId)"
  >
    <span class="src-dot" :class="dotClass" :style="dotStyle"></span>
    {{ label }}
    <button
      v-if="hasRefresh"
      class="src-refresh-btn"
      :class="{ loading: uiStore.isLoadingFeeds }"
      :title="`${label} aktualisieren`"
      @click.stop="feedsStore.refreshSource(sourceId)"
    >↻</button>
    <span v-if="feedError" class="src-feed-error" :title="feedError.message">
      {{ feedError.message }}
    </span>
    <span class="src-count">{{ count }}</span>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticlesStore } from '@/stores/articles'
import { useFeedsStore } from '@/stores/feeds'
import { useUiStore } from '@/stores/ui'

const props = defineProps<{
  sourceId: string
  label: string
  hasRefresh?: boolean
  dotColor?: string
}>()

const articlesStore = useArticlesStore()
const feedsStore = useFeedsStore()
const uiStore = useUiStore()

const isActive = computed(() => articlesStore.currentSource === props.sourceId)

const dotClass = computed(() =>
  props.dotColor ? undefined : `dot-${props.sourceId}`,
)
const dotStyle = computed(() =>
  props.dotColor ? { background: props.dotColor } : undefined,
)

const count = computed(() => {
  if (props.sourceId === 'all') return articlesStore.allItems.length
  if (props.sourceId === 'today') return articlesStore.todayCount
  return articlesStore.sourceCounts[props.sourceId] ?? 0
})

const feedError = computed(() => feedsStore.feedErrors[props.sourceId])
</script>
