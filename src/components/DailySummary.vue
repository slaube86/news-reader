<template>
  <div v-if="totalCount > 0" class="daily-summary" :class="{ collapsed }">
    <button class="summary-toggle" @click="toggle">
      <span class="summary-title">{{ t("summary.title") }}</span>
      <span class="summary-meta"
        >{{ totalCount }} {{ t("summary.articles") }} · {{ sourceCount }}
        {{ t("summary.sources") }}</span
      >
      <span class="chevron" :class="{ open: !collapsed }">▸</span>
    </button>

    <div v-show="!collapsed" class="summary-body">
      <!-- Top-Quellen -->
      <section class="summary-section">
        <h4 class="section-label">{{ t("summary.topSources") }}</h4>
        <div class="chips">
          <span
            v-for="s in sourceRanking"
            :key="s.source"
            class="chip"
            :class="`tag-${s.source}`"
            >{{ s.name }} ({{ s.count }})</span
          >
        </div>
      </section>

      <!-- Erwähnte Länder -->
      <section v-if="countryStats.length" class="summary-section">
        <h4 class="section-label">{{ t("summary.countries") }}</h4>
        <div class="country-list">
          <div
            v-for="hit in countryStats"
            :key="hit.country.code"
            class="country-row"
          >
            <img
              v-if="flagExists(hit.country.code)"
              :src="flagUrl(hit.country.code)"
              :alt="hit.country.name"
              class="flag-icon"
            />
            <span class="country-name">{{ hit.country.name }}</span>
            <span class="country-count">{{ hit.count }}</span>
          </div>
        </div>
      </section>

      <!-- Trending-Begriffe -->
      <section v-if="trendingKeywords.length" class="summary-section">
        <h4 class="section-label">{{ t("summary.trending") }}</h4>
        <div class="chips">
          <span
            v-for="kw in trendingKeywords"
            :key="kw.word"
            class="chip chip-keyword"
            :style="{ opacity: keywordOpacity(kw.count) }"
            >{{ kw.word }} ({{ kw.count }})</span
          >
        </div>
      </section>

      <!-- Zeitverlauf -->
      <section class="summary-section">
        <h4 class="section-label">{{ t("summary.timeline") }}</h4>
        <div class="time-bars">
          <div
            v-for="slot in timeDistribution"
            :key="slot.label"
            class="time-slot"
          >
            <span class="time-label">{{ slot.label }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: barWidth(slot.count) }"
              ></div>
            </div>
            <span class="time-count">{{ slot.count }}</span>
          </div>
        </div>
      </section>
      <RicePriceWidget />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDailySummary } from "@/composables/useDailySummary";
import { useI18n } from "@/composables/useI18n";
import RicePriceWidget from "./RicePriceWidget.vue";

const { t } = useI18n();

const STORAGE_KEY = "dailySummaryCollapsed";
const AVAILABLE_FLAGS = ["de", "us", "ir", "globe"];

const {
  sourceRanking,
  countryStats,
  trendingKeywords,
  timeDistribution,
  totalCount,
  sourceCount,
} = useDailySummary();

const collapsed = ref(true);

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) collapsed.value = stored === "true";
});

function toggle() {
  collapsed.value = !collapsed.value;
  localStorage.setItem(STORAGE_KEY, String(collapsed.value));
}

function flagExists(code: string): boolean {
  return AVAILABLE_FLAGS.includes(code.toLowerCase());
}

function flagUrl(code: string): string {
  return new URL(
    `../assets/icons/flags/${code.toLowerCase()}.svg`,
    import.meta.url,
  ).href;
}

function keywordOpacity(count: number): number {
  const max = trendingKeywords.value[0]?.count || 1;
  return 0.5 + 0.5 * (count / max);
}

function barWidth(count: number): string {
  const max = Math.max(...timeDistribution.value.map((s) => s.count), 1);
  return `${(count / max) * 100}%`;
}
</script>

<style scoped>
.daily-summary {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.summary-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--text);
  font-family: var(--font);
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
}
.summary-toggle:hover {
  background: var(--bg3);
}

.summary-title {
  font-weight: 600;
}

.summary-meta {
  color: var(--text2);
  font-size: 0.8rem;
  margin-left: auto;
}

.chevron {
  color: var(--text3);
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  display: inline-block;
}
.chevron.open {
  transform: rotate(90deg);
}

.summary-body {
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.section-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text3);
  margin: 0;
  font-weight: 500;
}

/* ── Chips ── */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.chip-keyword {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}

/* ── Länder ── */
.country-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.country-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.flag-icon {
  width: 18px;
  height: 14px;
  object-fit: contain;
}

.country-name {
  color: var(--text);
}

.country-count {
  color: var(--text2);
  font-size: 0.75rem;
  margin-left: auto;
  font-family: var(--mono);
}

/* ── Zeitverlauf ── */
.time-bars {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-label {
  width: 50px;
  font-size: 0.75rem;
  color: var(--text2);
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--accent2);
  border-radius: 3px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.time-count {
  width: 24px;
  text-align: right;
  font-size: 0.75rem;
  color: var(--text2);
  font-family: var(--mono);
  flex-shrink: 0;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .summary-toggle {
    flex-wrap: wrap;
  }
  .summary-meta {
    font-size: 0.7rem;
  }
}
</style>
