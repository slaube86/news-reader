<template>
  <nav class="sidebar" :class="{ active: uiStore.sidebarOpen }">
    <div class="sidebar-section-label">Quellen</div>
    <ul class="src-list">
      <SourceItem source-id="all" label="Alle Quellen" dot-color="#888" />
      <SourceItem source-id="today" label="Heute" dot-color="#f59e0b" />

      <!-- 🇩🇪 Deutsch -->
      <SourceItem source-id="tagesschau" label="Tagesschau" has-refresh />
      <SourceItem source-id="spiegel" label="Spiegel" has-refresh />
      <SourceItem source-id="zdf" label="ZDF" has-refresh />
      <SourceItem source-id="zeit" label="Zeit Online" has-refresh />

      <!-- 🇮🇷 Persisch -->
      <SourceItem source-id="iranintl" label="Iran International" has-refresh />
      <SourceItem source-id="aljazeera" label="Al Jazeera" has-refresh />
      <SourceItem source-id="mehr" label="Mehr News (FA)" has-refresh />
      <SourceItem source-id="bbcpersian" label="BBC Persian" has-refresh />
      <SourceItem source-id="entekhab" label="Entekhab (FA)" has-refresh />

      <!-- 🇺🇸 Amerikanisch -->
      <SourceItem source-id="nytimes" label="NYTimes" has-refresh />
      <SourceItem source-id="washpost" label="WashingtonPost" has-refresh />
      <SourceItem source-id="npr" label="NPR" has-refresh />

      <!-- 🌐 Sonstige -->
      <SourceItem source-id="netblocks" label="NetBlocks (Mastodon)" has-refresh />
    </ul>

    <div class="keyword-section">
      <div class="sidebar-section-label" style="margin-bottom:8px">Suche</div>
      <input
        v-model="articlesStore.searchKeyword"
        class="keyword-input"
        type="text"
        placeholder="Stichwort…"
      >
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useArticlesStore } from '@/stores/articles'
import { useUiStore } from '@/stores/ui'
import SourceItem from '@/components/SourceItem.vue'

const articlesStore = useArticlesStore()
const uiStore = useUiStore()
</script>
