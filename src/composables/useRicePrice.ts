import { ref, computed } from "vue";
import type { RicePricePoint, RicePriceCache } from "@/types/ricePrice";

// ── Cache ──
const CACHE_KEY = "ricePriceCache";
const CACHE_TTL = 24 * 60 * 60 * 1000;

// ── Rice price (USD/kg) ──
// Numbeo-Mittelwert der Marktspanne ($2.50–$4.00); manuell alle 2 Wochen prüfen.
const RICE_USD_PER_KG = 3.25;

// ── Endpoints ──

// jsDelivr CDN: CORS-frei, kein 302-Redirect, täglich via GitHub Actions aktualisiert
// Format: { "2025-05-01": { "eur": { "buy": 215000, "sell": 216000 } } }
const GH_LATEST =
  "https://cdn.jsdelivr.net/gh/SamadiPour/rial-exchange-rates-archive@data/gregorian_imp.min.json";

const GH_YEAR = (year: number) =>
  `https://raw.githubusercontent.com/SamadiPour/rial-exchange-rates-archive/main/gregorian/${year}/full`;

// Fallback EUR/IRR in case all sources fail (informeller Marktkurs)
const IRR_PER_EUR_FALLBACK = 800_000;

// ── Singleton state ──
const data = ref<RicePricePoint[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const irrRateSource = ref<"github" | "fallback">("fallback");
const irrRateCurrent = ref<number>(IRR_PER_EUR_FALLBACK);
let loadPromise: Promise<void> | null = null;

// ── Fetch helpers ──

async function directFetch(url: string): Promise<Response> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

// ── EUR/IRR: live rate ──

async function fetchIrrLive(): Promise<{
  rate: number;
  source: "github" | "fallback";
}> {
  try {
    const res = await directFetch(GH_LATEST);
    const json: Record<string, { eur?: { buy: number; sell: number } }> =
      await res.json();
    const dates = Object.keys(json).sort();
    for (let i = dates.length - 1; i >= 0; i--) {
      const entry = json[dates[i]]?.eur;
      if (entry?.sell && entry.sell > 1000) {
        return { rate: entry.sell * 10, source: "github" };
      }
    }
  } catch {
    /* fall through */
  }
  return { rate: IRR_PER_EUR_FALLBACK, source: "fallback" };
}

// ── EUR/IRR: monthly history ──

type GhArchive = Record<string, { eur?: { buy: number; sell: number } }>;

async function fetchIrrHistory(): Promise<Record<string, number>> {
  const now = new Date();
  const thisYear = now.getFullYear();
  const prevYear = thisYear - 1;

  const results = await Promise.allSettled([
    directFetch(GH_YEAR(prevYear)).then((r) => r.json()),
    directFetch(GH_YEAR(thisYear)).then((r) => r.json()),
  ]);

  const combined: GhArchive = {};
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      Object.assign(combined, r.value);
    }
  }
  if (Object.keys(combined).length === 0) return {};

  // Monthly averages: Toman sell price → × 10 = IRR
  const sums: Record<string, { sum: number; n: number }> = {};
  for (const [dateStr, val] of Object.entries(combined)) {
    const sell = val?.eur?.sell;
    if (!sell || sell < 1000) continue;
    const monthKey = dateStr.substring(0, 7);
    if (!sums[monthKey]) sums[monthKey] = { sum: 0, n: 0 };
    sums[monthKey].sum += sell;
    sums[monthKey].n++;
  }

  const result: Record<string, number> = {};
  for (const [key, { sum, n }] of Object.entries(sums)) {
    result[key] = Math.round((sum / n) * 10);
  }
  return result;
}

// ── USD→EUR: monthly rates from Frankfurter ──

async function fetchEurUsdHistory(
  fromDate: string,
): Promise<Record<string, number>> {
  const res = await directFetch(
    `https://api.frankfurter.dev/v1/${fromDate}..?from=USD&to=EUR`,
  );
  const fxData = await res.json();

  const byMonth: Record<string, number> = {};
  for (const [date, rates] of Object.entries(fxData.rates ?? {})) {
    const key = date.substring(0, 7);
    if (!byMonth[key]) byMonth[key] = (rates as Record<string, number>).EUR;
  }
  return byMonth;
}

// ── Main fetch ──

async function fetchAndBuild(): Promise<RicePricePoint[]> {
  const now = new Date();
  const from = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const fromDate = from.toISOString().substring(0, 10);

  const [irrLiveRes, irrHistoryRes, eurUsdRes] = await Promise.allSettled([
    fetchIrrLive(),
    fetchIrrHistory(),
    fetchEurUsdHistory(fromDate),
  ]);

  const { rate: liveIrr, source } =
    irrLiveRes.status === "fulfilled"
      ? irrLiveRes.value
      : { rate: IRR_PER_EUR_FALLBACK, source: "fallback" as const };

  const irrHistory =
    irrHistoryRes.status === "fulfilled" ? irrHistoryRes.value : {};
  const eurUsd =
    eurUsdRes.status === "fulfilled" ? eurUsdRes.value : {};

  irrRateCurrent.value = liveIrr;
  irrRateSource.value = source;

  if (eurUsdRes.status === "rejected") {
    console.warn("[RiceWidget] fetchEurUsdHistory fehlgeschlagen:", eurUsdRes.reason);
  }

  // Build 12 monthly data points
  const points: RicePricePoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const eurPerUsd = eurUsd[monthKey];
    if (!eurPerUsd) continue;
    const irrPerEur = irrHistory[monthKey] ?? liveIrr;
    const eurPerKg = Math.round(RICE_USD_PER_KG * eurPerUsd * 100) / 100;
    points.push({
      month: monthKey,
      label: d.toLocaleDateString("de-DE", { month: "short", year: "2-digit" }),
      eurPerKg,
      irrPerKg: Math.round(eurPerKg * irrPerEur),
    });
  }

  if (points.length === 0) throw new Error("Keine Kursdaten verfügbar");
  return points;
}

// ── Load with cache ──

async function load(): Promise<void> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: RicePriceCache = JSON.parse(raw);
      if (
        cached.fetchedAt &&
        Date.now() - cached.fetchedAt < CACHE_TTL &&
        cached.points?.length
      ) {
        data.value = cached.points;
        return;
      }
    }
  } catch {
    /* ignore */
  }

  loading.value = true;
  error.value = null;
  try {
    const points = await fetchAndBuild();
    data.value = points;
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ points, fetchedAt: Date.now() } satisfies RicePriceCache),
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

// ── Public API ──

export function useRicePrice() {
  function ensureLoaded() {
    if (!loadPromise && data.value.length === 0 && !loading.value) {
      loadPromise = load().finally(() => {
        loadPromise = null;
      });
    }
  }

  const latest = computed(() => data.value[data.value.length - 1]);
  const previous = computed(() => data.value[data.value.length - 2]);

  const eurChange = computed(() => {
    if (!latest.value || !previous.value) return null;
    return (
      ((latest.value.eurPerKg - previous.value.eurPerKg) /
        previous.value.eurPerKg) *
      100
    );
  });

  return {
    data,
    loading,
    error,
    latest,
    previous,
    eurChange,
    irrRateSource,
    irrRateCurrent,
    ensureLoaded,
    reload: load,
  };
}
