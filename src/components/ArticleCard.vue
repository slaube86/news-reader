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
        v-if="article.desc && highlight"
        class="art-desc"
        v-html="highlightedDesc"
      ></div>
      <div v-else-if="article.desc" class="art-desc">{{ article.desc }}</div>
    </a>
    <template v-if="isTranslatable">
      <button class="art-translate-btn" @click.prevent.stop="doTranslate">
        {{ t("card.translate", { lang: targetLangLabel }) }}
      </button>
      <div v-if="translation" class="art-translation">{{ translation }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
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
