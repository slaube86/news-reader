<template>
  <nav class="sidebar map-sidebar">
    <div class="sidebar-section-label">{{ t('map.countries') }}</div>
    <ul class="src-list">
      <li
        class="src-item"
        :class="{ active: !selectedCountry }"
        @click="selectCountry(null)"
      >
        <span class="src-dot" style="background: #888"></span>
        {{ t('map.allCountries') }}
        <span class="src-count">{{ countryStats.length }}</span>
      </li>
      <li
        v-for="hit in countryStats"
        :key="hit.country.code"
        class="src-item"
        :class="{ active: selectedCountry?.country.code === hit.country.code }"
        @click="selectCountry(hit)"
      >
        <span class="src-dot" style="background: var(--accent)"></span>
        {{ hit.country.name }}
        <span class="src-count">{{ hit.count }}</span>
      </li>
    </ul>
  </nav>

  <main class="main map-main">
    <div ref="mapContainer" class="map-container"></div>

    <div v-if="selectedCountry" class="map-detail">
      <div class="detail-header">
        <h3>{{ selectedCountry.country.name }}</h3>
        <span class="detail-count">{{ selectedCountry.count }} {{ t('map.articles') }}</span>
        <button class="detail-close" @click="selectCountry(null)">✕</button>
      </div>
      <div class="detail-sources">
        <span v-for="(count, source) in selectedCountry.sources" :key="source" class="detail-source">
          {{ source }}: {{ count }}
        </span>
      </div>
      <div class="detail-articles">
        <ArticleCard
          v-for="article in selectedCountry.articles.slice(0, 10)"
          :key="article.id"
          :article="article"
          :highlight="selectedCountry.country.terms"
        />
        <span v-if="selectedCountry.articles.length > 10" class="detail-more">
          {{ t('map.andMore', { n: selectedCountry.articles.length - 10 }) }}
        </span>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useArticlesStore } from '@/stores/articles'
import { buildCountryStats, type CountryHit } from '@/utils/countryDetector'
import { useI18n } from '@/composables/useI18n'
import ArticleCard from '@/components/ArticleCard.vue'

const { t } = useI18n()

defineEmits<{ close: [] }>()

const articlesStore = useArticlesStore()
const mapContainer = ref<HTMLElement | null>(null)
const selectedCountry = ref<CountryHit | null>(null)

const countryStats = computed(() => buildCountryStats(articlesStore.allItems))

let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null
let highlightLayer: L.CircleMarker | null = null

function getMarkerRadius(count: number, maxCount: number): number {
  const min = 6
  const max = 28
  return min + (count / maxCount) * (max - min)
}

function selectCountry(hit: CountryHit | null) {
  selectedCountry.value = hit
  if (highlightLayer) {
    highlightLayer.remove()
    highlightLayer = null
  }
  if (hit && map) {
    map.flyTo([hit.country.lat, hit.country.lng], 5, { duration: 0.6 })
    const maxCount = countryStats.value.length > 0 ? countryStats.value[0].count : 1
    highlightLayer = L.circleMarker([hit.country.lat, hit.country.lng], {
      radius: getMarkerRadius(hit.count, maxCount) + 6,
      fillColor: 'transparent',
      fillOpacity: 0,
      color: '#fff',
      weight: 2,
      dashArray: '4 4',
    }).addTo(map)
  }
}

function renderMarkers() {
  if (!map) return
  if (markerLayer) markerLayer.clearLayers()
  else markerLayer = L.layerGroup().addTo(map)

  const stats = countryStats.value
  const maxCount = stats.length > 0 ? stats[0].count : 1

  for (const hit of stats) {
    const radius = getMarkerRadius(hit.count, maxCount)
    const marker = L.circleMarker([hit.country.lat, hit.country.lng], {
      radius,
      fillColor: '#e85444',
      fillOpacity: 0.6,
      color: '#c8392b',
      weight: 1.5,
    })

    marker.bindTooltip(
      `<strong>${hit.country.name}</strong><br>${hit.count} ${t('map.articles')}`,
      { direction: 'top', offset: [0, -radius] },
    )

    marker.on('click', () => {
      selectCountry(hit)
    })

    marker.addTo(markerLayer!)
  }
}

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: [30, 50],
    zoom: 4,
    zoomControl: true,
    attributionControl: true,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 12,
  }).addTo(map)

  renderMarkers()
})

watch(() => articlesStore.allItems.length, () => {
  renderMarkers()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style>
.map-sidebar {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  padding: 1.5rem 1.2rem;
  border-right: 1px solid var(--border);
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
}

.map-main {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 1rem;
}

.map-container {
  flex: 1;
  min-height: 400px;
  border-radius: 10px;
  overflow: hidden;
}

.map-container .leaflet-container {
  background: var(--bg);
}

.map-detail {
  border-top: 1px solid var(--border);
  padding: 12px 16px;
  max-height: 260px;
  overflow-y: auto;
  background: var(--bg2);
  border-radius: 10px;
  margin-top: 1rem;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.detail-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.detail-count {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--accent2);
}

.detail-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
}

.detail-close:hover {
  color: var(--text);
}

.detail-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.detail-source {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text2);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 3px;
}

.detail-articles {
  display: flex;
  flex-direction: column;
}

.detail-more {
  font-size: 12px;
  color: var(--text3);
  padding: 4px 0;
}

@media (max-width: 768px) {
  .map-sidebar {
    display: none;
  }
}
</style>
