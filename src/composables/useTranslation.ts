import { TRANSLATE_URL } from "@/config/constants";
import { useI18n } from "@/composables/useI18n";

/**
 * Translates the given text from `sourceLang` into the user's system language
 * (detected via `translationLang` from useI18n — one of 'de' | 'en' | 'fa').
 *
 * @param text       The raw article text to translate.
 * @param sourceLang The ISO 639-1 language code of the article ('de' | 'en' | 'fa').
 */
export async function translateArticle(
  text: string,
  sourceLang: string,
): Promise<string> {
  const { t, translationLang } = useI18n();
  try {
    const res = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source: sourceLang,
        target: translationLang,
      }),
    });
    const data = await res.json();
    if (data && data.translated_text) {
      return data.translated_text as string;
    }
    return t("card.translationFailed");
  } catch {
    return t("card.translationFailed");
  }
}
