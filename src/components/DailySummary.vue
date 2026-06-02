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
            :class="[
              `tag-${s.source}`,
              { 'chip--hidden': articlesStore.hiddenSources.has(s.source) },
            ]"
            @click="articlesStore.toggleHiddenSource(s.source)"
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

      <!-- Tendenz -->
      <section v-if="dailySentiment.length > 1" class="summary-section">
        <h4 class="section-label">
          {{ t("summary.tendency") }}
          <span class="tendency-badge" :class="tendencyClass">{{
            tendencyLabel
          }}</span>
        </h4>

        <!-- Legend -->
        <div class="tendency-legend">
          <span class="legend-item">
            <span
              class="legend-swatch"
              style="background: var(--sentiment-hostile)"
            ></span>
            {{ t("summary.tendencyEsc") }}
          </span>
          <span class="legend-item">
            <span
              class="legend-swatch"
              style="background: var(--sentiment-neutral)"
            ></span>
            {{ t("summary.tendencyNeutral") }}
          </span>
          <span class="legend-item">
            <span
              class="legend-swatch"
              style="background: var(--sentiment-peaceful)"
            ></span>
            {{ t("summary.tendencyDesc") }}
          </span>
          <span class="legend-hint">{{ t("summary.tendencyHint") }}</span>
        </div>

        <!-- 14-day line chart -->
        <div class="tendency-chart-outer">
          <div class="tendency-chart-wrap" @touchstart="hideTooltip">
            <svg class="tendency-chart" :viewBox="`0 0 ${CW} ${CH}`" width="100%">
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#22c55e" stop-opacity="0.25" />
                  <stop
                    :offset="CZERO_GRAD"
                    stop-color="#22c55e"
                    stop-opacity="0"
                  />
                  <stop
                    :offset="CZERO_GRAD"
                    stop-color="#c8392b"
                    stop-opacity="0"
                  />
                  <stop offset="100%" stop-color="#c8392b" stop-opacity="0.25" />
                </linearGradient>
              </defs>
              <line
                :x1="CL"
                :y1="CZERO"
                :x2="CR"
                :y2="CZERO"
                stroke="rgba(255,255,255,0.1)"
                stroke-width="0.5"
                stroke-dasharray="3,3"
              />
              <path :d="chartArea" fill="url(#sg)" />
              <polyline
                :points="chartPolyline"
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                stroke-width="1.5"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <circle
                v-for="(day, i) in dailySentiment"
                :key="day.date"
                :cx="cx(i, dailySentiment.length)"
                :cy="cy(day.score)"
                r="4"
                :fill="sentimentColor(day.score)"
                class="chart-dot"
                @mouseenter="showTooltip(day, i)"
                @mouseleave="hideTooltip"
                @touchstart.stop.prevent="toggleTooltip(day, i)"
              />
              <text
                v-for="tick in chartTicks"
                :key="tick.x"
                :x="tick.x"
                :y="CH - 1"
                text-anchor="middle"
                font-size="7"
                fill="var(--text3)"
              >
                {{ tick.label }}
              </text>
            </svg>
          </div>

          <!-- Fancy tooltip – außerhalb des Scroll-Containers, damit overflow-x nicht clippt -->
          <div v-if="activeTooltip" class="chart-tooltip" :style="tooltipStyle">
            <div class="ct-date">{{ activeTooltip.label }}</div>
            <div
              class="ct-score"
              :style="{ color: sentimentColor(activeTooltip.score) }"
            >
              {{ activeTooltip.score > 0 ? "+" : ""
              }}{{ (activeTooltip.score * 100).toFixed(0) }}
              <span class="ct-score-label">Score</span>
            </div>
            <div class="ct-divider"></div>
            <div class="ct-stat">
              <span
                class="ct-swatch"
                style="background: var(--sentiment-hostile)"
              ></span>
              {{ activeTooltip.hostileCount }} feindlich
            </div>
            <div class="ct-stat">
              <span
                class="ct-swatch"
                style="background: var(--sentiment-peaceful)"
              ></span>
              {{ activeTooltip.peacefulCount }} friedlich
            </div>
            <div class="ct-total">{{ activeTooltip.articleCount }} Artikel</div>
          </div>
        </div>

        <!-- Per-source diverging bar chart, grouped by language -->
        <div v-if="false && groupedSources.length > 0" class="source-bars">
          <div class="source-bars-axis">
            <span>← {{ t("summary.tendencyEsc") }}</span>
            <span>{{ t("summary.tendencyDesc") }} →</span>
          </div>
          <template v-for="group in groupedSources" :key="group.lang">
            <div class="source-group-label">{{ group.label }}</div>
            <div
              v-for="src in group.sources"
              :key="src.source"
              class="source-bar-row"
            >
              <span class="source-bar-name">{{ src.sourceName }}</span>
              <div class="source-bar-track">
                <div class="source-bar-center"></div>
                <div
                  class="source-bar-fill"
                  :style="{
                    left: sourceBarLeft(src.score),
                    width: sourceBarWidth(src.score),
                    background: sentimentColor(src.score),
                  }"
                ></div>
              </div>
              <span
                class="source-bar-val"
                :style="{ color: sentimentColor(src.score) }"
              >
                {{ src.score > 0 ? "+" : "" }}{{ (src.score * 100).toFixed(0) }}
              </span>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDailySummary } from "@/composables/useDailySummary";
import { useSentiment } from "@/composables/useSentiment";
import type { DaySentiment } from "@/composables/useSentiment";
import { useI18n } from "@/composables/useI18n";
import { useArticlesStore } from "@/stores/articles";

const { t } = useI18n();
const articlesStore = useArticlesStore();

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

const { dailySentiment, recentTrend, groupedSources } = useSentiment();

// ── SVG line chart constants ───────────────────────────────────────────────
const CW = 400,
  CH = 80;
const CT = 4,
  CB = 58,
  CL = 6,
  CR = 394;
const CZERO = CT + (CB - CT) / 2; // zero-line y coordinate
const CZERO_GRAD = `${((CZERO / CH) * 100).toFixed(1)}%`;

function cx(i: number, n: number): number {
  return CL + (i / Math.max(n - 1, 1)) * (CR - CL);
}
function cy(score: number): number {
  return CT + ((1 - score) / 2) * (CB - CT);
}

const chartPolyline = computed(() =>
  dailySentiment.value
    .map(
      (d, i) =>
        `${cx(i, dailySentiment.value.length).toFixed(1)},${cy(d.score).toFixed(1)}`,
    )
    .join(" "),
);

const chartArea = computed(() => {
  const data = dailySentiment.value;
  if (data.length < 2) return "";
  const n = data.length;
  const pts = data
    .map((d, i) => `${cx(i, n).toFixed(1)},${cy(d.score).toFixed(1)}`)
    .join(" ");
  return `M${cx(0, n).toFixed(1)},${CZERO} L${pts} L${cx(n - 1, n).toFixed(1)},${CZERO}Z`;
});

const chartTicks = computed(() => {
  const data = dailySentiment.value;
  const n = data.length;
  const step = n <= 7 ? 1 : n <= 10 ? 2 : 3;
  return data
    .map((d, i) => ({ x: cx(i, n), label: d.label, i }))
    .filter(({ i }) => i % step === 0 || i === n - 1);
});

// ── Tooltip ───────────────────────────────────────────────────────────────
interface ChartTooltip extends DaySentiment {
  svgX: number;
  svgY: number;
}

const activeTooltip = ref<ChartTooltip | null>(null);

function showTooltip(day: DaySentiment, i: number) {
  activeTooltip.value = {
    ...day,
    svgX: cx(i, dailySentiment.value.length),
    svgY: cy(day.score),
  };
}
function hideTooltip() {
  activeTooltip.value = null;
}
function toggleTooltip(day: DaySentiment, i: number) {
  if (activeTooltip.value?.date === day.date) hideTooltip();
  else showTooltip(day, i);
}

const tooltipStyle = computed(() => {
  if (!activeTooltip.value) return {};
  const xPct = (activeTooltip.value.svgX / CW) * 100;
  const yPct = (activeTooltip.value.svgY / CH) * 100;
  const flipX = xPct > 55;
  return {
    left: flipX ? "auto" : `${xPct}%`,
    right: flipX ? `${100 - xPct}%` : "auto",
    top: `${yPct}%`,
    transform: "translateY(-50%)",
    marginLeft: flipX ? "0" : "10px",
    marginRight: flipX ? "10px" : "0",
  };
});

function sourceBarLeft(score: number): string {
  return score < 0 ? `${(50 + score * 50).toFixed(1)}%` : "50%";
}
function sourceBarWidth(score: number): string {
  return `${(Math.abs(score) * 50).toFixed(1)}%`;
}

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

/** Map score [-1…+1] to a color: red (hostile) → yellow (neutral) → green (peaceful) */
function sentimentColor(score: number): string {
  if (score < -0.15) return "var(--sentiment-hostile)";
  if (score > 0.15) return "var(--sentiment-peaceful)";
  return "var(--sentiment-neutral)";
}

const tendencyLabel = computed(() => {
  const t_ = recentTrend.value;
  if (t_ < -0.1) return t("summary.tendencyEsc");
  if (t_ > 0.1) return t("summary.tendencyDesc");
  return t("summary.tendencyMixed");
});

const tendencyClass = computed(() => {
  const t_ = recentTrend.value;
  if (t_ < -0.1) return "tendency-esc";
  if (t_ > 0.1) return "tendency-desc";
  return "tendency-mixed";
});
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
  cursor: pointer;
  transition: opacity 0.15s;
  user-select: none;
}
.chip:hover {
  opacity: 0.75;
}
.chip--hidden {
  opacity: 0.3;
  text-decoration: line-through;
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

/* ── Tendenz ── */
.tendency-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  vertical-align: middle;
}
.tendency-esc {
  background: rgba(200, 57, 43, 0.2);
  color: var(--sentiment-hostile);
}
.tendency-desc {
  background: rgba(34, 197, 94, 0.15);
  color: var(--sentiment-peaceful);
}
.tendency-mixed {
  background: rgba(160, 120, 32, 0.2);
  color: var(--sentiment-neutral);
}

.tendency-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: var(--text2);
}
.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
  opacity: 0.8;
}
.legend-hint {
  margin-left: auto;
  font-size: 0.62rem;
  color: var(--text3);
  font-style: italic;
}

.tendency-chart-outer {
  position: relative;
  margin-bottom: 0.5rem;
}
.tendency-chart-wrap {
  overflow-x: auto;
}
.tendency-chart {
  display: block;
  overflow: visible;
  min-width: 400px;
}
.chart-dot {
  cursor: pointer;
  transition:
    r 0.1s ease,
    opacity 0.1s ease;
}
.chart-dot:hover {
  opacity: 1;
  r: 5;
}

/* ── Fancy tooltip ── */
.chart-tooltip {
  position: absolute;
  z-index: 20;
  pointer-events: none;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  min-width: 140px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55);
  white-space: nowrap;
}
.ct-date {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}
.ct-score {
  font-family: var(--mono);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  margin-bottom: 0.3rem;
}
.ct-score-label {
  font-size: 0.58rem;
  color: var(--text3);
  font-family: var(--font);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ct-divider {
  height: 1px;
  background: var(--border);
  margin: 0.3rem 0;
}
.ct-stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--text2);
  line-height: 1.7;
}
.ct-swatch {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ct-total {
  font-size: 0.65rem;
  color: var(--text3);
  margin-top: 0.2rem;
}

.source-bars-axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: var(--text3);
  padding-left: 104px; /* align with the bar track */
  padding-right: 32px;
  margin-bottom: 0.2rem;
}

/* ── Source diverging bars ── */
.source-bars {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.source-group-label {
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text3);
  margin-top: 0.4rem;
  padding-bottom: 0.15rem;
  border-bottom: 1px solid var(--border);
}
.source-group-label:first-child {
  margin-top: 0;
}
.source-bar-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.source-bar-name {
  width: 100px;
  flex-shrink: 0;
  font-size: 0.7rem;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.source-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  position: relative;
}
.source-bar-center {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
}
.source-bar-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  min-width: 2px;
  opacity: 0.75;
}
.source-bar-val {
  width: 28px;
  text-align: right;
  font-family: var(--mono);
  font-size: 0.65rem;
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
