import { computed } from "vue";
import { useArticlesStore } from "@/stores/articles";
import { SOURCE_LANG } from "@/config/feeds";

// ── Keyword lists ──────────────────────────────────────────────────────────
// Signals escalation / conflict / repression
const HOSTILE: string[] = [
  // DE
  "krieg", "angriff", "explosion", "rakete", "bombe", "hinrichtung",
  "verhaftung", "festnahme", "erschossen", "getötet", "tote", "opfer",
  "drohung", "eskalation", "offensive", "razzia", "todesurteil", "attentat",
  "beschuss", "luftangriff", "militärschlag", "gefangen",
  // EN
  "war", "attack", "explosion", "missile", "bomb", "execution", "arrested",
  "killed", "dead", "casualties", "threat", "escalation", "offensive",
  "airstrike", "strike", "crackdown", "death sentence", "hanged", "detained",
  "hostage", "siege", "assassination", "gunfire", "nuclear threat",
  // FA
  "جنگ", "حمله", "انفجار", "موشک", "بمب", "اعدام", "دستگیری",
  "کشته", "تهدید", "اعتراضات", "سرکوب", "بازداشت",
];

// Signals diplomacy / de-escalation / positive outcomes
const PEACEFUL: string[] = [
  // DE
  "frieden", "waffenstillstand", "verhandlung", "verhandlungen", "gespräch",
  "gespräche", "abkommen", "vereinbarung", "freilassung", "freigelassen",
  "diplomatie", "dialog", "einigung", "deeskalation", "gipfel", "reform",
  "kooperation", "zusammenarbeit", "humanitär", "waffenruhe",
  // EN
  "peace", "ceasefire", "negotiations", "talks", "agreement", "deal",
  "release", "freed", "diplomacy", "dialogue", "settlement", "de-escalation",
  "summit", "reform", "cooperation", "humanitarian", "truce", "accord",
  // FA
  "صلح", "آتش‌بس", "مذاکره", "توافق", "آزادی", "دیپلماسی",
  "گفتگو", "اصلاحات", "همکاری",
];

// ── Types ──────────────────────────────────────────────────────────────────

export interface DaySentiment {
  date: string;        // "YYYY-MM-DD"
  label: string;       // "10. Jan"
  score: number;       // -1 (hostile) … +1 (peaceful)
  hostileCount: number;
  peacefulCount: number;
  articleCount: number;
}

export interface SourceSentiment {
  source: string;
  sourceName: string;
  score: number;       // -1 (hostile) … +1 (peaceful)
  articleCount: number;
}

export interface LangGroup {
  lang: string;
  label: string;
  sources: SourceSentiment[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function scoreText(text: string): number {
  const lower = text.toLowerCase();
  const h = HOSTILE.filter((k) => lower.includes(k)).length;
  const p = PEACEFUL.filter((k) => lower.includes(k)).length;
  return p - h;
}

/** Clamp raw score to [-1, +1] — divides by 3 so ±3 keyword matches = full signal */
function normalize(raw: number): number {
  return Math.max(-1, Math.min(1, raw / 3));
}

// ── Composable ─────────────────────────────────────────────────────────────

export function useSentiment() {
  const store = useArticlesStore();

  const dailySentiment = computed((): DaySentiment[] => {
    const byDay = new Map<
      string,
      { scoreSum: number; hostile: number; peaceful: number; total: number }
    >();

    for (const article of store.allItems) {
      const d = new Date(article.date);
      if (isNaN(d.getTime())) continue;
      const key = d.toISOString().substring(0, 10);

      if (!byDay.has(key)) {
        byDay.set(key, { scoreSum: 0, hostile: 0, peaceful: 0, total: 0 });
      }

      const text = article.title + " " + (article.desc ?? "");
      const raw = scoreText(text);
      const entry = byDay.get(key)!;
      entry.scoreSum += raw;
      entry.total++;
      if (raw < 0) entry.hostile++;
      else if (raw > 0) entry.peaceful++;
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, data]) => {
        const d = new Date(dateStr);
        const avgRaw = data.total > 0 ? data.scoreSum / data.total : 0;
        return {
          date: dateStr,
          label: d.toLocaleDateString("de-DE", {
            day: "numeric",
            month: "short",
          }),
          score: normalize(avgRaw),
          hostileCount: data.hostile,
          peacefulCount: data.peaceful,
          articleCount: data.total,
        };
      });
  });

  /** Average score of the last 7 days — positive = tending peaceful, negative = tending hostile */
  const recentTrend = computed(() => {
    const recent = dailySentiment.value.slice(-7);
    if (!recent.length) return 0;
    return recent.reduce((s, d) => s + d.score, 0) / recent.length;
  });

  const LANG_GROUPS = [
    { lang: "de" as const, label: "Deutsch" },
    { lang: "en" as const, label: "Amerikanisch" },
    { lang: "fa" as const, label: "Persisch" },
  ];

  const groupedSources = computed((): LangGroup[] => {
    const bySource = new Map<string, { scoreSum: number; total: number; name: string }>();

    for (const article of store.allItems) {
      const lang = SOURCE_LANG[article.source];
      if (!lang) continue;
      if (!bySource.has(article.source)) {
        bySource.set(article.source, { scoreSum: 0, total: 0, name: article.sourceName });
      }
      const text = article.title + " " + (article.desc ?? "");
      const raw = scoreText(text);
      const entry = bySource.get(article.source)!;
      entry.scoreSum += raw;
      entry.total++;
    }

    return LANG_GROUPS.map(({ lang, label }) => ({
      lang,
      label,
      sources: Array.from(bySource.entries())
        .filter(([source]) => SOURCE_LANG[source] === lang)
        .map(([source, data]) => ({
          source,
          sourceName: data.name,
          score: normalize(data.total > 0 ? data.scoreSum / data.total : 0),
          articleCount: data.total,
        }))
        .sort((a, b) => a.score - b.score),
    })).filter((g) => g.sources.length > 0);
  });

  return { dailySentiment, recentTrend, groupedSources };
}
