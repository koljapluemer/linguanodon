import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { Language } from '@/entities/Language'
import type { ExerciseFlashcard } from '@/utils/exercise/types/exerciseTypes'

/**
 * Generates basic flashcards for a unit of meaning in both directions between user target and native languages.
 * For units in a target language:
 *   - One flashcard with the target content on front, all native translations on back.
 *   - One flashcard per native translation, with native content on front and target content on back.
 * For units in a native language:
 *   - One flashcard per unique target language in translations, native content on front, all translations in that target lang on back.
 *   - One flashcard per translation in a user's target lang, translation content on front, native content on back.
 * Each flashcard includes an instruction property indicating the translation direction.
 */
export function generateBasicFlashcardsForUnitAndLanguages(
  unit: UnitOfMeaning,
  targetLanguages: Language[],
  nativeLanguages: Language[]
): ExerciseFlashcard[] {
  const flashcards: ExerciseFlashcard[] = []
  const targetLangCodes = targetLanguages.map(l => l.code)
  const nativeLangCodes = nativeLanguages.map(l => l.code)

  /**
   * Returns the language name for a given code, or the code if not found.
   */
  const langName = (code: string) =>
    targetLanguages.find(l => l.code === code)?.name ||
    nativeLanguages.find(l => l.code === code)?.name ||
    code

  // If the unit is in a target language
  if (targetLangCodes.includes(unit.language)) {
    // 1. Flashcard: target content -> all native translations
    const nativeTranslations = unit.translations.filter(t => nativeLangCodes.includes(t.language))
    if (nativeTranslations.length > 0) {
      flashcards.push({
        type: 'flashcard',
        front: unit.content,
        back: nativeTranslations.map(t => t.content).join(', '),
        instruction: `Translate to ${nativeTranslations.length === 1 ? langName(nativeTranslations[0].language) : 'your native language'}`
      })
    }
    // 2. Flashcard: each native translation -> target content
    for (const t of nativeTranslations) {
      flashcards.push({
        type: 'flashcard',
        front: t.content,
        back: unit.content,
        instruction: `Translate to ${langName(unit.language)}`
      })
    }
  }

  // If the unit is in a native language
  if (nativeLangCodes.includes(unit.language)) {
    // 3. For each unique target lang in translations, native content -> all translations in that target lang
    const translationsByTargetLang: Record<string, string[]> = {}
    for (const t of unit.translations) {
      if (targetLangCodes.includes(t.language)) {
        if (!translationsByTargetLang[t.language]) translationsByTargetLang[t.language] = []
        translationsByTargetLang[t.language].push(t.content)
      }
    }
    for (const targetLang of Object.keys(translationsByTargetLang)) {
      flashcards.push({
        type: 'flashcard',
        front: unit.content,
        back: translationsByTargetLang[targetLang].join(', '),
        instruction: `Translate to ${langName(targetLang)}`
      })
    }
    // 4. For each translation in a user's target lang, translation content -> native content
    for (const t of unit.translations) {
      if (targetLangCodes.includes(t.language)) {
        flashcards.push({
          type: 'flashcard',
          front: t.content,
          back: unit.content,
          instruction: `Translate to ${langName(unit.language)}`
        })
      }
    }
  }

  return flashcards
}
