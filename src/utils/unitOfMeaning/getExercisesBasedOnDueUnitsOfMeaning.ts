import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { Language } from '@/entities/Language'
import type { Exercise } from '@/entities/Exercises'
import { getDueUnitsOfMeaning } from './getDueUnitsOfMeaning'
import { generateExercisesForUnitOfMeaning } from '@/utils/exercise/generateExercisesForUnitOfMeaning'

/**
 * Returns all exercises generated from due units of meaning for the given user languages.
 * Uses getDueUnitsOfMeaning and generateExercisesForUnitOfMeaning.
 */
export async function getExercisesBasedOnDueUnitsOfMeaning(
  unitRepo: UnitOfMeaningRepository,
  targetLanguages: Language[],
  nativeLanguages: Language[]
): Promise<Exercise[]> {
  const dueUnits = await getDueUnitsOfMeaning(unitRepo)
  const allExercises: Exercise[] = []
  for (const unit of dueUnits) {
    const unitExercises = await generateExercisesForUnitOfMeaning(unit, targetLanguages, nativeLanguages, unitRepo)
    allExercises.push(...unitExercises)
  }
  return allExercises
} 