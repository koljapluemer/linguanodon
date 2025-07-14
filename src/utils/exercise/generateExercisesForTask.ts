import type { Task } from '@/entities/Task'
import type { Language } from '@/entities/Language'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { Exercise } from '@/utils/exercise/types/exerciseTypes'
import { generateClozesForUnitAndLanguage } from './generators/generateClozesForUnitAndLanguage'
import { generateChooseFromTwoForUnitAndLanguage } from './generators/generateChooseFromTwoForUnitAndLanguage'
import { generateFreeTranslationForUnitAndLanguage } from './generators/generateFreeTranslationForUnitAndLanguage'

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
  const nativeLanguageCodes = nativeLanguages.map(l => l.code)
  
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
      const chooseFromTwoExercises = await generateChooseFromTwoForUnitAndLanguage(unit, language.code, unitRepository)
      
      allExercises.push(...flashcardExercises, ...chooseFromTwoExercises)
    }
    // Generate free-translation exercises (only for target -> native)
    for (const targetLang of targetLanguages) {
      const freeTranslationExercises = await generateFreeTranslationForUnitAndLanguage(
        unit,
        targetLang.code,
        nativeLanguageCodes,
        unitRepository
      )
      allExercises.push(...freeTranslationExercises)
    }
  }
  
  return allExercises
}
