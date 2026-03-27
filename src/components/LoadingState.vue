<template>
  <div v-if="loading" class="state-box">
    <div class="loader"></div>
    <p>Artikel werden geladen…</p>
    <small>Das kann bis zu 1 Minute dauern</small>
  </div>
  <div v-else-if="empty" class="state-box">
    <span class="icon">📭</span>
    <p>Keine Artikel gefunden</p>
    <small>Versuche es erneut oder ändere den Filter</small>
  </div>
  <div v-else-if="offline" class="state-box">
    <span class="icon">⚠</span>
    <p>Keine Verbindung zu den Feeds</p>
    <small>Internetverbindung prüfen und erneut versuchen</small>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean
  empty?: boolean
  offline?: boolean
}>()
</script>
