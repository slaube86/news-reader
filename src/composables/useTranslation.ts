import { TRANSLATE_URL } from '@/config/constants'
import { useI18n } from '@/composables/useI18n'

export async function translateArticle(text: string): Promise<string> {
  const { t } = useI18n()
  try {
    const res = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source: 'fa', target: 'de' }),
    })
    const data = await res.json()
    if (data && data.translated_text) {
      return data.translated_text as string
    }
    return t('card.translationFailed')
  } catch {
    return t('card.translationFailed')
  }
}
