import type { Task } from '@/entities/Task'
import type { Language } from '@/entities/Language'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { Exercise } from '@/utils/exercise/types/exerciseTypes'
import { generateExercisesForUnitOfMeaning } from './generateExercisesForUnitOfMeaning'

/**
 * Generates all possible exercises for a task
 * Loops through each unit associated with the task and generates exercises for each user language
 * unitMode: 'primary' | 'secondary' | 'all' determines which units to use
 * If limitNumberOfExercises is true, randomly picks 20 exercises from the result.
 */
export async function generateExercisesForTask(
  task: Task,
  targetLanguages: Language[],
  nativeLanguages: Language[],
  unitRepository: UnitOfMeaningRepository,
  unitMode: 'primary' | 'secondary' | 'all' = 'all',
  limitNumberOfExercises: boolean 
): Promise<Exercise[]> {
  const allExercises: Exercise[] = []

  let unitRefs: { language: string; content: string }[] = []
  if (unitMode === 'primary') {
    unitRefs = task.primaryUnitsOfMeaning
  } else if (unitMode === 'secondary') {
    unitRefs = task.secondaryUnitsOfMeaning
  } else {
    unitRefs = [...task.primaryUnitsOfMeaning, ...task.secondaryUnitsOfMeaning]
  }

  for (const unitRef of unitRefs) {
    const unit = await unitRepository.findUnitOfMeaning(unitRef.language, unitRef.content)
    if (!unit) {
      console.warn(`Unit not found: ${unitRef.language}:${unitRef.content}`)
      continue
    }
    const exercises = await generateExercisesForUnitOfMeaning(
      unit,
      targetLanguages,
      nativeLanguages,
      unitRepository
    )
    allExercises.push(...exercises)
  }

  if (limitNumberOfExercises && allExercises.length > 20) {
    // Shuffle and pick 20
    for (let i = allExercises.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allExercises[i], allExercises[j]] = [allExercises[j], allExercises[i]]
    }
    return allExercises.slice(0, 20)
  }
  return allExercises
}
