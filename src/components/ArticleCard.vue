<template>
  <div class="article">
    <a :href="article.link || '#'" target="_blank" rel="noopener noreferrer">
      <div class="art-top">
        <span class="src-tag" :class="`tag-${article.source}`">{{
          article.sourceName
        }}</span>
        <span class="art-date">{{ formatDate(article.date) }}</span>
      </div>
      <div v-if="highlight" class="art-title" v-html="highlightedTitle"></div>
      <div v-else class="art-title">{{ article.title }}</div>

      <div
        v-if="article.desc"
        class="art-desc-wrap"
        :class="{ 'is-expanded': expanded }"
      >
        <div
          v-if="article.desc && highlight"
          ref="descRef"
          class="art-desc"
          v-html="highlightedDesc"
        ></div>
        <div v-else-if="article.desc" ref="descRef" class="art-desc">
          {{ article.desc }}
        </div>
        <div v-if="!expanded && needsExpand" class="art-desc-fade"></div>
      </div>
    </a>

    <button
      v-if="needsExpand"
      class="art-expand-btn"
      @click.stop="expanded = !expanded"
    >
      {{ expanded ? t("card.showLess") : t("card.showMore") }}
    </button>

    <template v-if="isTranslatable">
      <button class="art-translate-btn" @click.prevent.stop="doTranslate">
        {{ t("card.translate", { lang: targetLangLabel }) }}
      </button>
      <div v-if="translation" class="art-translation">{{ translation }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Article } from "@/types/article";
import { SOURCE_LANG } from "@/config/feeds";
import { formatDate } from "@/utils/formatters";
import { translateArticle } from "@/composables/useTranslation";
import { highlightTerms } from "@/utils/countryDetector";
import { useI18n } from "@/composables/useI18n";

const { t, translationLang } = useI18n();

/** Human-readable label for each supported target language. */
const LANG_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  fa: "فارسی",
};

const props = defineProps<{
  article: Article;
  highlight?: string[];
}>();

const translation = ref("");

// ── Collapsible description ──────────────────────────────────────────────────
const DESC_MAX_HEIGHT = 150; // px — keep in sync with CSS
const expanded = ref(false);
const needsExpand = ref(false);
const descRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (descRef.value) {
    needsExpand.value = descRef.value.scrollHeight > DESC_MAX_HEIGHT;
  }
});

// ── Translation ───────────────────────────────────────────────────────────────
/** The content language of this article's source feed. Falls back to 'en' for unknown sources. */
const articleSourceLang = computed(
  () => SOURCE_LANG[props.article.source] ?? "en",
);

/**
 * Show the translate button only when the article's language differs from
 * the user's target translation language (detected from navigator.language).
 */
const isTranslatable = computed(
  () => articleSourceLang.value !== translationLang,
);

/** Display name of the translation target language, e.g. "Deutsch", "English", "فارسی". */
const targetLangLabel = LANG_NAMES[translationLang] ?? "English";

const highlightedTitle = computed(() =>
  props.highlight ? highlightTerms(props.article.title, props.highlight) : "",
);

const highlightedDesc = computed(() =>
  props.highlight && props.article.desc
    ? highlightTerms(props.article.desc, props.highlight)
    : "",
);

async function doTranslate() {
  translation.value = t("card.translating");
  const text = `${props.article.title}${props.article.desc ? "\n\n" + props.article.desc : ""}`;
  translation.value = await translateArticle(text, articleSourceLang.value);
}
</script>
