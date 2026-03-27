import { TRANSLATE_URL } from '@/config/constants'

export async function translateArticle(text: string): Promise<string> {
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
    return 'Übersetzung fehlgeschlagen'
  } catch {
    return 'Übersetzung fehlgeschlagen'
  }
}
