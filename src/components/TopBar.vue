<template>
  <header class="topbar">
    <div class="topbar-row">
      <div class="logo" @click="articlesStore.setCurrentSource('today')">
        <span class="logo-flag">🇮🇷</span>
        {{ t('topbar.logo') }}
        <div class="live-dot"></div>
      </div>
      <span class="last-update">{{ lastUpdated }}</span>
    </div>
    <div class="topbar-row topbar-right">
      <button class="btn-refresh btn-sidebar-toggle" :disabled="showMap" @click="uiStore.toggleSidebar()">
        <span class="icon">☰</span> {{ t('topbar.sources') }}
      </button>
      <span class="last-update" id="nextUpdate" style="margin-left:12px">{{ countdownDisplay }}</span>
      <button
        class="btn-refresh"
        :class="{ active: showMap }"
        @click="$emit('toggleMap')"
      >
        <span class="icon">🗺️</span> {{ t('topbar.map') }}
      </button>
      <button
        class="btn-refresh"
        :class="{ spinning: uiStore.isLoadingFeeds }"
        :disabled="uiStore.isLoadingFeeds"
        @click="$emit('refresh')"
      >
        <span class="icon">↻</span> {{ t('topbar.refresh') }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

defineProps<{
  lastUpdated: string
  countdownDisplay: string
  showMap: boolean
}>()

defineEmits<{
  refresh: []
  toggleMap: []
}>()

const articlesStore = useArticlesStore()
const uiStore = useUiStore()
</script>
