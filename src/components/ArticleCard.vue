<template>
  <div class="article">
    <a :href="article.link || '#'" target="_blank" rel="noopener noreferrer">
      <div class="art-top">
        <span class="src-tag" :class="`tag-${article.source}`">{{ article.sourceName }}</span>
        <span class="art-date">{{ formatDate(article.date) }}</span>
      </div>
      <div class="art-title">{{ article.title }}</div>
      <div v-if="article.desc" class="art-desc">{{ article.desc }}</div>
    </a>
    <template v-if="isFarsi">
      <button class="art-translate-btn" @click.prevent.stop="doTranslate">
        Übersetzen
      </button>
      <div v-if="translation" class="art-translation">{{ translation }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Article } from '@/types/article'
import { FARSI_SOURCES } from '@/config/feeds'
import { formatDate } from '@/utils/formatters'
import { translateArticle } from '@/composables/useTranslation'

const props = defineProps<{
  article: Article
}>()

const translation = ref('')

const isFarsi = computed(() =>
  (FARSI_SOURCES as readonly string[]).includes(props.article.source),
)

async function doTranslate() {
  translation.value = 'Übersetzung wird geladen...'
  const text = `${props.article.title}${props.article.desc ? '\n\n' + props.article.desc : ''}`
  translation.value = await translateArticle(text)
}
</script>
