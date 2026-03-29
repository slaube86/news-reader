<template>
  <header class="topbar">
    <div class="topbar-row">
      <div class="logo" @click="articlesStore.setCurrentSource('today')">
        <span class="logo-flag">🇮🇷</span>
        Iran News Reader
        <div class="live-dot"></div>
      </div>
      <span class="last-update">{{ lastUpdated }}</span>
    </div>
    <div class="topbar-row topbar-right">
      <button class="btn-refresh btn-sidebar-toggle" @click="uiStore.toggleSidebar()">
        <span class="icon">☰</span> Quellen
      </button>
      <span class="last-update" id="nextUpdate" style="margin-left:12px">{{ countdownDisplay }}</span>
      <button
        class="btn-refresh"
        :class="{ active: showMap }"
        :disabled="uiStore.isLoadingFeeds"
        @click="$emit('toggleMap')"
      >
        <span class="icon">🗺️</span> Karte
      </button>
      <button
        class="btn-refresh"
        :class="{ spinning: uiStore.isLoadingFeeds }"
        :disabled="uiStore.isLoadingFeeds"
        @click="$emit('refresh')"
      >
        <span class="icon">↻</span> Aktualisieren
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'

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
