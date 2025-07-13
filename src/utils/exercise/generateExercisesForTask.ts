import type { Task } from '@/entities/Task'
import type { Language } from '@/entities/Language'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { Exercise } from '@/utils/exercise/types/Exercise'
import { generateClozesForUnitAndLanguage } from './generators/generateClozesForUnitAndLanguage'
import { generateChooseFromTwoForUnitAndLanguage } from './generators/generateChooseFromTwoForUnitAndLanguage'

/**
 * Generates all possible exercises for a task
 * Loops through each unit associated with the task and generates exercises for each user language
 */
export async function generateExercisesForTask(
  task: Task,
  targetLanguages: Language[],
  nativeLanguages: Language[],
  unitRepository: UnitOfMeaningRepository
): Promise<Exercise[]> {
  const allExercises: Exercise[] = []
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
      // Generate both types of exercises
      const flashcardExercises = generateClozesForUnitAndLanguage(unit, language.code)
      const chooseFromTwoExercises = generateChooseFromTwoForUnitAndLanguage(unit, language.code)
      
      allExercises.push(...flashcardExercises, ...chooseFromTwoExercises)
    }
  }
  
  return allExercises
}
