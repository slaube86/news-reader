<template>
  <div
    v-if="uiStore.sidebarOpen"
    class="sidebar-overlay"
    :class="{ active: uiStore.sidebarOpen }"
    @click="uiStore.toggleSidebar(false)"
  ></div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>
