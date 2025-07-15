import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseFreeTranslation } from '@/utils/exercise/types/exerciseTypes'
import type { ExerciseGeneratorInterface } from './ExerciseGeneratorInterface'
import { splitIntoTokens } from '@/utils/exercise/utils/splitIntoTokens'
import { isWordToken } from '@/utils/exercise/utils/isWordToken'

/**
 * Simple hash function for generating readable, unique-enough strings for UIDs.
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

/**
 * Generator for free-translation exercises for a unit of meaning.
 */
export const freeTranslationGenerator: ExerciseGeneratorInterface<[
  UnitOfMeaning,
  string,
  string[],
  UnitOfMeaningRepository
]> = {
  /**
   * Produces all free-translation exercises for a unit, target language, and native languages.
   */
  generateExercises: async (unit, targetLanguageCode, nativeLanguageCodes, unitRepository) => {
    if (unit.language !== targetLanguageCode) {
      return []
    }
    const tokens = splitIntoTokens(unit.content)
    const wordCount = tokens.filter(isWordToken).length
    if (wordCount < 3) {
      return []
    }
    const exercises: ExerciseFreeTranslation[] = []
    for (const nativeLang of nativeLanguageCodes) {
      const translationRef = unit.translations.find(t => t.language === nativeLang)
      if (!translationRef) {
        continue
      }
      const translationUnit = await unitRepository.findUnitOfMeaning(nativeLang, translationRef.content)
      if (!translationUnit) {
        continue
      }
      exercises.push({
        type: 'free-translation',
        front: unit.content,
        back: translationUnit.content,
        instruction: 'Translate the sentence',
        primaryUnitOfMeaning: { language: unit.language, content: unit.content },
        secondaryUnitsOfMeaning: [{ language: translationUnit.language, content: translationUnit.content }]
      })
    }
    return exercises
  },
  /**
   * Returns the UID and a human-readable string for a given free-translation exercise.
   */
  getUid: (exercise) => {
    if (exercise.type !== 'free-translation') throw new Error('Not a free-translation exercise')
    const uid = `freetrans_${hashString(exercise.front)}_${hashString(exercise.back)}`
    const humanReadable = `FreeTranslation: ${exercise.primaryUnitOfMeaning.language} | ${exercise.front}`
    return { uid, humanReadable }
  }
} 