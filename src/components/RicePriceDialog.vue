<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <button
            class="modal-close"
            aria-label="Schließen"
            @click="$emit('close')"
          >
            ✕
          </button>

          <h2 class="modal-title">{{ t("rice.dialog.title") }}</h2>
          <p class="modal-subtitle">{{ t("rice.dialog.subtitle") }}</p>

          <div v-if="loading" class="dialog-loading">
            {{ t("rice.loading") }}
          </div>
          <div v-else-if="error" class="dialog-error">
            {{ t("rice.error") }}
          </div>

          <div v-else class="chart-wrap">
            <canvas ref="canvasRef"></canvas>
          </div>

          <div v-if="!loading && !error && latest" class="dialog-stats">
            <div class="stat-item">
              <span class="stat-label">{{ t("rice.dialog.latest") }}</span>
              <span class="stat-value"
                >{{ formatEur(latest.eurPerKg) }} / kg</span
              >
            </div>
            <div class="stat-item">
              <span class="stat-label"
                >IRR {{ t("rice.dialog.approxNote") }}</span
              >
              <span class="stat-value irr-value"
                >{{ formatIrr(latest.irrPerKg) }} / kg</span
              >
            </div>
            <div v-if="eurChange !== null" class="stat-item">
              <span class="stat-label">vs. {{ previous?.label }} (letzter Wert)</span>
              <span
                class="stat-value"
                :class="eurChange >= 0 ? 'change-up' : 'change-down'"
              >
                {{ eurChange >= 0 ? "+" : "" }}{{ eurChange.toFixed(2) }}%
              </span>
            </div>
          </div>

          <p class="dialog-source">
            {{ t("rice.dialog.source") }}:
            <a href="https://www.numbeo.com/cost-of-living/" target="_blank" rel="noopener">Numbeo</a>
            &amp;
            <a href="https://www.frankfurter.dev" target="_blank" rel="noopener">Frankfurter API</a>
            &amp;
            <a href="https://github.com/SamadiPour/rial-exchange-rates-archive" target="_blank" rel="noopener">bonbast.com</a>
            · IRR-Kurs: ~{{ irrRateCurrent.toLocaleString("de-DE") }} ﷼/€ ({{
              IRR_SOURCE_LABEL[irrRateSource] ?? irrRateSource
            }})
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from "vue";
import type { Chart as ChartType } from "chart.js";
import { useRicePrice } from "@/composables/useRicePrice";
import { useI18n } from "@/composables/useI18n";

defineEmits<{ close: [] }>();

const { t } = useI18n();
const {
  data,
  loading,
  error,
  latest,
  previous,
  eurChange,
  irrRateSource,
  irrRateCurrent,
} = useRicePrice();

const IRR_SOURCE_LABEL: Record<string, string> = {
  github: "bonbast.com (via GitHub)",
  fallback: "Schätzwert",
};

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: ChartType | null = null;

async function buildChart() {
  if (!canvasRef.value || data.value.length === 0) return;

  const {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler,
  } = await import("chart.js");

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler,
  );

  chart?.destroy();

  const labels = data.value.map((p) => p.label);
  const eurData = data.value.map((p) => p.eurPerKg);
  const irrData = data.value.map((p) => p.irrPerKg);

  chart = new Chart(canvasRef.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "EUR / kg",
          data: eurData,
          borderColor: "#e85444",
          backgroundColor: "rgba(232, 84, 68, 0.08)",
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: true,
          yAxisID: "yEur",
        },
        {
          label: "IRR / kg (~)",
          data: irrData,
          borderColor: "#5b9cf6",
          backgroundColor: "rgba(91, 156, 246, 0.06)",
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          yAxisID: "yIrr",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: {
            color: "#9a9a9a",
            font: { family: "'IBM Plex Sans', sans-serif", size: 11 },
            boxWidth: 12,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: "#1e1e1e",
          borderColor: "rgba(255,255,255,0.14)",
          borderWidth: 1,
          titleColor: "#e8e8e8",
          bodyColor: "#9a9a9a",
          padding: 10,
          callbacks: {
            label(ctx) {
              const y = ctx.parsed.y;
              if (y === null || y === undefined) return "";
              if (ctx.datasetIndex === 0)
                return ` EUR: ${(y as number).toFixed(2)}`;
              return ` IRR: ${(y as number).toLocaleString("de-DE")}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#606060", font: { size: 10 } },
        },
        yEur: {
          type: "linear",
          position: "left",
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#e85444",
            font: { size: 10 },
            callback: (v) => `€${Number(v).toFixed(2)}`,
          },
        },
        yIrr: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: {
            color: "#5b9cf6",
            font: { size: 10 },
            callback: (v) => `${(Number(v) / 1000).toFixed(0)}k ﷼`,
          },
        },
      },
    },
  });
}

watch(
  [() => data.value.length, loading],
  async ([len, isLoading]) => {
    if (!isLoading && len > 0) {
      await nextTick();
      buildChart();
    }
  },
  { immediate: true },
);

onUnmounted(() => chart?.destroy());

function formatEur(v: number): string {
  return v.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

function formatIrr(v: number): string {
  return v.toLocaleString("de-DE") + " ﷼";
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  position: relative;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 12px;
  max-width: 560px;
  width: 100%;
  padding: 1.75rem 1.75rem 1.25rem;
  color: var(--text);
  font-family: var(--font);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text3);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}
.modal-close:hover {
  color: var(--text);
}

.modal-title {
  margin: 0 0 0.2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-subtitle {
  margin: 0 0 1.25rem;
  font-size: 0.8rem;
  color: var(--text3);
}

.dialog-loading,
.dialog-error {
  padding: 2rem 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text3);
}

.chart-wrap {
  position: relative;
  width: 100%;
}

.dialog-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--bg3);
  border-radius: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 90px;
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text3);
}

.stat-value {
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--text);
}

.irr-value {
  color: var(--text2);
  font-size: 0.78rem;
}

.change-up {
  color: #f87171;
}

.change-down {
  color: var(--green);
}

.dialog-source {
  margin: 0.75rem 0 0;
  font-size: 0.65rem;
  color: var(--text3);
  line-height: 1.5;
}
.dialog-source a {
  color: var(--text3);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.dialog-source a:hover {
  color: var(--text2);
}

/* ── Transition ── */
.modal-enter-active {
  transition: opacity 0.22s ease;
}
.modal-enter-active .modal-container {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-leave-active .modal-container {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .modal-container {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }
  .modal-container {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 1.25rem 1.25rem 1.5rem;
    max-width: 100%;
  }
  .dialog-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
