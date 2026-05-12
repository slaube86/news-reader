<template>
  <section class="summary-section rice-widget">
    <h4 class="section-label">{{ t('rice.title') }}</h4>

    <div v-if="loading" class="rice-loading">{{ t('rice.loading') }}</div>

    <div v-else-if="error" class="rice-error">
      <span class="rice-error-msg">{{ error }}</span>
      <button class="rice-retry" @click="reload">↻</button>
    </div>

    <button v-else-if="latest" class="rice-card" @click="dialogOpen = true">
      <div class="rice-prices">
        <div class="rice-price-row">
          <span class="rice-currency">EUR</span>
          <span class="rice-value">{{ formatEur(latest.eurPerKg) }}</span>
          <span
            v-if="eurChange !== null"
            class="rice-change"
            :class="changeClass"
            :title="previous ? `vs. ${previous.label} (letzter verf. Wert)` : undefined"
          >{{ formatChange(eurChange) }}</span>
        </div>
        <div class="rice-price-row">
          <span class="rice-currency">IRR</span>
          <span class="rice-value rice-irr">{{ formatIrr(latest.irrPerKg) }}</span>
          <span class="rice-approx">~</span>
        </div>
      </div>

      <div class="rice-sparkline-wrap">
        <svg class="rice-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
          <polyline :points="sparklinePoints" fill="none" stroke="var(--accent2)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
        </svg>
        <span class="rice-detail-hint">{{ t('rice.details') }} →</span>
      </div>
    </button>

    <RicePriceDialog v-if="dialogOpen" @close="dialogOpen = false" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRicePrice } from '@/composables/useRicePrice'
import { useI18n } from '@/composables/useI18n'
import RicePriceDialog from './RicePriceDialog.vue'

const { t } = useI18n()
const { data, loading, error, latest, previous, eurChange, ensureLoaded, reload } = useRicePrice()

const dialogOpen = ref(false)

onMounted(() => ensureLoaded())

const changeClass = computed(() => {
  if (eurChange.value === null) return ''
  return eurChange.value >= 0 ? 'change-up' : 'change-down'
})

const sparklinePoints = computed(() => {
  if (data.value.length < 2) return ''
  const values = data.value.map((p) => p.eurPerKg)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 100
  const h = 24
  const pad = 2

  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

function formatEur(v: number): string {
  return v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
}

function formatIrr(v: number): string {
  return v.toLocaleString('de-DE') + ' ﷼'
}

function formatChange(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}%`
}
</script>

<style scoped>
.rice-widget {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.rice-loading,
.rice-error {
  font-size: 0.75rem;
  color: var(--text3);
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.rice-error-msg {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  font-size: 0.7rem;
  line-height: 1.4;
}

.rice-retry {
  background: none;
  border: none;
  color: var(--accent2);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  line-height: 1;
}

.rice-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  width: 100%;
  text-align: left;
  color: var(--text);
  font-family: var(--font);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: border-color 0.15s, background 0.15s;
}

.rice-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--border2);
}

.rice-prices {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.rice-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-size: 0.75rem;
}

.rice-currency {
  color: var(--text3);
  font-size: 0.65rem;
  font-family: var(--mono);
  width: 22px;
  flex-shrink: 0;
}

.rice-value {
  font-family: var(--mono);
  color: var(--text);
  font-size: 0.78rem;
}

.rice-irr {
  font-size: 0.72rem;
  color: var(--text2);
}

.rice-approx {
  font-size: 0.65rem;
  color: var(--text3);
}

.rice-change {
  font-size: 0.65rem;
  font-family: var(--mono);
  margin-left: auto;
}

.change-up {
  color: #f87171;
}

.change-down {
  color: var(--green);
}

.rice-sparkline-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
}

.rice-sparkline {
  width: 72px;
  height: 28px;
  display: block;
}

.rice-detail-hint {
  font-size: 0.6rem;
  color: var(--text3);
  white-space: nowrap;
}
</style>
