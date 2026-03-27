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
      <span class="last-update" style="margin-left:12px">{{ countdownDisplay }}</span>
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
}>()

defineEmits<{
  refresh: []
}>()

const articlesStore = useArticlesStore()
const uiStore = useUiStore()
</script>
