import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { ExerciseFlashcard } from '@/utils/exercise/types/exerciseTypes'
import { splitIntoTokens } from '@/utils/exercise/utils/splitIntoTokens'
import { isWordToken } from '@/utils/exercise/utils/isWordToken'
import { makeClozeTokens } from '@/utils/exercise/utils/makeClozeTokens'
import { wrapWithDirection } from '@/utils/exercise/utils/wrapWithDirection'

/**
 * Generates all possible cloze exercises for a unit of meaning in a specific language
 * Creates exercises in both directions:
 * 1. Original content clozed, translation as hint
 * 2. Translation clozed, original content as hint
 */
export function generateClozesForUnitAndLanguage(
  unit: UnitOfMeaning,
  targetLanguage: string
): ExerciseFlashcard[] {
  const exercises: ExerciseFlashcard[] = []

  // Find translations in the target language
  const targetTranslations = unit.translations.filter(ref => ref.language === targetLanguage)

  if (targetTranslations.length === 0) {
    return []
  }

  // Generate clozes for the unit's content (the main content gets clozed)
  const tokens = splitIntoTokens(unit.content)
  const wordIndexes = tokens.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)

  if (wordIndexes.length <= 1) {
    return []
  }

  // Create one exercise per word (excluding very short words)
  wordIndexes.forEach((wordIdx) => {
    const word = tokens[wordIdx]
    if (word.length < 3) return

    // Create cloze version of the content
    const clozeContent = makeClozeTokens(tokens, wordIdx)

    // Show all translations in the target language as context
    const contextText = targetTranslations.map(ref => ref.content).join(' / ')

    const front = `${wrapWithDirection(clozeContent)}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`
    const back = `${wrapWithDirection(unit.content.replace(word, `<mark>${word}</mark>`))}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`

    exercises.push({
      type: 'flashcard',
      front,
      back,
      instruction: 'Fill in the blank',
      primaryUnitOfMeaning: { language: unit.language, content: unit.content },
      secondaryUnitsOfMeaning: targetTranslations.map(t => ({ language: t.language, content: t.content }))
    })
  })

  // Generate reverse exercises: clozing the translations
  for (const translation of targetTranslations) {
    const translationTokens = splitIntoTokens(translation.content)
    const translationWordIndexes = translationTokens.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)

    if (translationWordIndexes.length <= 1) continue

    translationWordIndexes.forEach((wordIdx) => {
      const word = translationTokens[wordIdx]
      if (word.length < 3) return

      // Create cloze version of the translation
      const clozeContent = makeClozeTokens(translationTokens, wordIdx)

      // Show original content as context
      const contextText = unit.content

      const front = `${wrapWithDirection(clozeContent)}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`
      const back = `${wrapWithDirection(translation.content.replace(word, `<mark>${word}</mark>`))}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`

      exercises.push({
        type: 'flashcard',
        front,
        back,
        instruction: 'Fill in the blank',
        primaryUnitOfMeaning: { language: unit.language, content: unit.content },
        secondaryUnitsOfMeaning: [{ language: translation.language, content: translation.content }]
      })
    })
  }

  return exercises
}
