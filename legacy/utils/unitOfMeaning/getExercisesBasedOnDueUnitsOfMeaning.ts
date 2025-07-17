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

/**
 * Generates exercises for a batch of due units of meaning.
 * Returns a flat array of exercises for the given units and user languages.
 */
export async function getExercisesForDueUnitsBatch(
  units: Parameters<typeof generateExercisesForUnitOfMeaning>[0][],
  targetLanguages: Parameters<typeof generateExercisesForUnitOfMeaning>[1],
  nativeLanguages: Parameters<typeof generateExercisesForUnitOfMeaning>[2],
  unitRepo: Parameters<typeof generateExercisesForUnitOfMeaning>[3]
): Promise<Exercise[]> {
  const allExercises: Exercise[] = []
  for (const unit of units) {
    const unitExercises = await generateExercisesForUnitOfMeaning(unit, targetLanguages, nativeLanguages, unitRepo)
    allExercises.push(...unitExercises)
  }
  return allExercises
} 