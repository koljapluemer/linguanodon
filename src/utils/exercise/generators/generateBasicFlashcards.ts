import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { Language } from '@/entities/Language'
import type { ExerciseFlashcard } from '@/entities/Exercises'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'
import type { ExerciseGeneratorInterface } from './ExerciseGeneratorInterface'

/**
 * Generator for basic bidirectional flashcard exercises for a unit of meaning.
 */
/**
 * Simple hash function for generating readable, unique-enough strings for UIDs.
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Generates basic flashcard exercises for a unit of meaning, covering both directions (target→native and native→target).
 */
export const basicFlashcardGenerator: ExerciseGeneratorInterface<[
  UnitOfMeaning,
  Language[],
  Language[]
]> = {
  /**
   * Produces all basic flashcard exercises for a unit and language sets.
   */
  generateExercises: (unit, targetLanguages, nativeLanguages) => {
    const flashcards: ExerciseFlashcard[] = []
    const targetLangCodes = targetLanguages.map(l => l.code)
    const nativeLangCodes = nativeLanguages.map(l => l.code)

    /**
     * Looks up the display name for a language code, falling back to the code if not found.
     */
    const langName = (code: string) =>
      targetLanguages.find(l => l.code === code)?.name ||
      nativeLanguages.find(l => l.code === code)?.name ||
      code

    if (targetLangCodes.includes(unit.language)) {
      const nativeTranslations = unit.translations.filter(t => nativeLangCodes.includes(t.language))
      if (nativeTranslations.length > 0) {
        const exercise: ExerciseFlashcard = {
          type: 'flashcard',
          front: unit.content,
          back: nativeTranslations.map(t => t.content).join(', '),
          instruction: `Translate to ${nativeTranslations.length === 1 ? langName(nativeTranslations[0].language) : 'your native language'}`,
          primaryUnitOfMeaning: { language: unit.language, content: unit.content },
          secondaryUnitsOfMeaning: nativeTranslations.map(t => ({ language: t.language, content: t.content })),
          uid: '',
          humanReadableName: ''
        }
        const { uid, humanReadable } = basicFlashcardGenerator.getUid(exercise)
        exercise.uid = uid
        exercise.humanReadableName = humanReadable
        flashcards.push(exercise)
      }
      for (const t of nativeTranslations) {
        const exercise: ExerciseFlashcard = {
          type: 'flashcard',
          front: t.content,
          back: unit.content,
          instruction: `Translate to ${langName(unit.language)}`,
          primaryUnitOfMeaning: { language: unit.language, content: unit.content },
          secondaryUnitsOfMeaning: [{ language: t.language, content: t.content }],
          uid: '',
          humanReadableName: ''
        }
        const { uid, humanReadable } = basicFlashcardGenerator.getUid(exercise)
        exercise.uid = uid
        exercise.humanReadableName = humanReadable
        flashcards.push(exercise)
      }
    }

    if (nativeLangCodes.includes(unit.language)) {
      const translationsByTargetLang: Record<string, UnitOfMeaningIdentification[]> = {}
      for (const t of unit.translations) {
        if (targetLangCodes.includes(t.language)) {
          if (!translationsByTargetLang[t.language]) translationsByTargetLang[t.language] = []
          translationsByTargetLang[t.language].push({ language: t.language, content: t.content })
        }
      }
      for (const targetLang of Object.keys(translationsByTargetLang)) {
        const translations = translationsByTargetLang[targetLang]
        const exercise: ExerciseFlashcard = {
          type: 'flashcard',
          front: unit.content,
          back: translations.map(t => t.content).join(', '),
          instruction: `Translate to ${langName(targetLang)}`,
          primaryUnitOfMeaning: { language: unit.language, content: unit.content },
          secondaryUnitsOfMeaning: translations,
          uid: '',
          humanReadableName: ''
        }
        const { uid, humanReadable } = basicFlashcardGenerator.getUid(exercise)
        exercise.uid = uid
        exercise.humanReadableName = humanReadable
        flashcards.push(exercise)
      }
      for (const t of unit.translations) {
        if (targetLangCodes.includes(t.language)) {
          const exercise: ExerciseFlashcard = {
            type: 'flashcard',
            front: t.content,
            back: unit.content,
            instruction: `Translate to ${langName(unit.language)}`,
            primaryUnitOfMeaning: { language: unit.language, content: unit.content },
            secondaryUnitsOfMeaning: [{ language: t.language, content: t.content }],
            uid: '',
            humanReadableName: ''
          }
          const { uid, humanReadable } = basicFlashcardGenerator.getUid(exercise)
          exercise.uid = uid
          exercise.humanReadableName = humanReadable
          flashcards.push(exercise)
        }
      }
    }
    return Promise.resolve(flashcards)
  },
  /**
   * Returns the UID and a human-readable string for a given flashcard exercise.
   * @param exercise The exercise to generate a UID for
   * @returns An object with uid and humanReadable string
   */
  getUid: (exercise) => {
    if (exercise.type !== 'flashcard') throw new Error('Not a flashcard exercise')
    const uid = `flashcard_${hashString(exercise.front)}_${hashString(exercise.back)}`
    const humanReadable = `Flashcard: ${exercise.primaryUnitOfMeaning.language} → ${exercise.secondaryUnitsOfMeaning.map((u: UnitOfMeaningIdentification) => u.language).join(', ')} | ${exercise.front}`
    return { uid, humanReadable }
  }
}
