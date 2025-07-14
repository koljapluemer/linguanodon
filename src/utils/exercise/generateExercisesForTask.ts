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
 * unitMode: 'primary' | 'secondary' | 'all' determines which units to use
 */
export async function generateExercisesForTask(
  task: Task,
  targetLanguages: Language[],
  nativeLanguages: Language[],
  unitRepository: UnitOfMeaningRepository,
  unitMode: 'primary' | 'secondary' | 'all' = 'all'
): Promise<Exercise[]> {
  const allExercises: Exercise[] = []
  const allLanguages = [...targetLanguages, ...nativeLanguages]
  const nativeLanguageCodes = nativeLanguages.map(l => l.code)

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
  }
  return allExercises
}
