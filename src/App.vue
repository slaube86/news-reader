<template>
  <TopBar
    :last-updated="lastUpdated"
    :countdown-display="countdownDisplay"
    @refresh="loadAll"
  />

  <div class="layout">
    <SidebarOverlay />
    <SideBar />

    <main class="main">
      <StatsBar />
      <ArticleList />
    </main>
  </div>

  <footer class="disclaimer">
    &copy; 2026 - Dieses Webprojekt wurde von Sebastian Laube umgesetzt.
    Inhalte werden über Aggregierte RSS-Feeds geladen; sie stammen nicht von mir
    und unterliegen den jeweiligen Medienquellen.
  </footer>

  <ToastNotification />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFeedsStore } from '@/stores/feeds'
import { useArticlesStore } from '@/stores/articles'
import { useAutoRefresh } from '@/composables/useAutoRefresh'
import { formatLastUpdated } from '@/utils/formatters'
import TopBar from '@/components/TopBar.vue'
import SideBar from '@/components/SideBar.vue'
import SidebarOverlay from '@/components/SidebarOverlay.vue'
import StatsBar from '@/components/StatsBar.vue'
import ArticleList from '@/components/ArticleList.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const feedsStore = useFeedsStore()
const articlesStore = useArticlesStore()

const lastUpdated = ref('—')

async function loadAll() {
  await feedsStore.fetchAllFeeds()
  lastUpdated.value = formatLastUpdated(new Date().toISOString())
  autoRefresh.startCountdown()
}

const autoRefresh = useAutoRefresh(loadAll)
const countdownDisplay = autoRefresh.countdownDisplay

onMounted(async () => {
  await articlesStore.loadFromDB()
  await loadAll()
})
</script>
