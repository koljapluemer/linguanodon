import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { Language } from '@/entities/Language'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { Exercise } from '@/utils/exercise/types/exerciseTypes'
import { generateClozesForUnitAndLanguage } from './generators/generateClozesForUnitAndLanguage'
import { generateChooseFromTwoForUnitAndLanguage } from './generators/generateChooseFromTwoForUnitAndLanguage'
import { generateFreeTranslationForUnitAndLanguage } from './generators/generateFreeTranslationForUnitAndLanguage'
import { generateBasicFlashcardsForUnitAndLanguages } from './generators/generateBasicFlashcards'

/**
 * Generates all possible exercises for a given unit of meaning and user languages.
 * Used by generateExercisesForTask and other utilities.
 */
export async function generateExercisesForUnitOfMeaning(
  unit: UnitOfMeaning,
  targetLanguages: Language[],
  nativeLanguages: Language[],
  unitRepository: UnitOfMeaningRepository
): Promise<Exercise[]> {
  const allExercises: Exercise[] = []
  // Add basic flashcards
  allExercises.push(...generateBasicFlashcardsForUnitAndLanguages(unit, targetLanguages, nativeLanguages))
  const allLanguages = [...targetLanguages, ...nativeLanguages]
  const nativeLanguageCodes = nativeLanguages.map(l => l.code)

  for (const language of allLanguages) {
    const flashcardExercises = generateClozesForUnitAndLanguage(unit, language.code)
    allExercises.push(...flashcardExercises)
  }
  for (const targetLang of targetLanguages) {
    const chooseFromTwoExercises = await generateChooseFromTwoForUnitAndLanguage(unit, targetLang.code, unitRepository)
    allExercises.push(...chooseFromTwoExercises)
  }
  for (const targetLang of targetLanguages) {
    const freeTranslationExercises = await generateFreeTranslationForUnitAndLanguage(
      unit,
      targetLang.code,
      nativeLanguageCodes,
      unitRepository
    )
    allExercises.push(...freeTranslationExercises)
  }
  return allExercises
}
