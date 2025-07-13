import type { Task } from '@/entities/Task'
import type { Language } from '@/entities/Language'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseFlashcard } from '@/utils/exercise/types/ExerciseFlashcard'
import { generateClozesForUnitAndLanguage } from './generators/generateClozesForUnitAndLanguage'

/**
 * Generates all possible cloze exercises for a task
 * Loops through each unit associated with the task and generates clozes for each user language
 */
export async function generateExercisesForTask(
  task: Task,
  targetLanguages: Language[],
  nativeLanguages: Language[],
  unitRepository: UnitOfMeaningRepository
): Promise<ExerciseFlashcard[]> {
  const allExercises: ExerciseFlashcard[] = []
  const allLanguages = [...targetLanguages, ...nativeLanguages]
  
  // Loop through each unit associated with the task
  for (const unitRef of task.unitsOfMeaning) {
    // Look up the actual unit from the repository
    const unit = await unitRepository.findUnitOfMeaning(unitRef.language, unitRef.content)
    
    if (!unit) {
      console.warn(`Unit not found: ${unitRef.language}:${unitRef.content}`)
      continue
    }
    
    // Loop through all user languages (both target and native)
    for (const language of allLanguages) {
      const exercises = generateClozesForUnitAndLanguage(unit, language.code)
      allExercises.push(...exercises)
    }
  }
  
  return allExercises
}
