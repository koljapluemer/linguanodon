import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseFreeTranslation } from '@/utils/exercise/types/exerciseTypes'
import { splitIntoTokens } from '@/utils/exercise/utils/splitIntoTokens'
import { isWordToken } from '@/utils/exercise/utils/isWordToken'

/**
 * Generates free-translation exercises for a unit, for all native languages
 */
export async function generateFreeTranslationForUnitAndLanguage(
  unit: UnitOfMeaning,
  targetLanguageCode: string,
  nativeLanguageCodes: string[],
  unitRepository: UnitOfMeaningRepository
): Promise<ExerciseFreeTranslation[]> {
  // Only generate if the unit is in the target language
  if (unit.language !== targetLanguageCode) return []

  // Count words in the target sentence
  const tokens = splitIntoTokens(unit.content)
  const wordCount = tokens.filter(isWordToken).length
  if (wordCount < 3) return []

  // For each native language, find the translation and create the exercise
  const exercises: ExerciseFreeTranslation[] = []
  for (const nativeLang of nativeLanguageCodes) {
    const translationRef = unit.translations.find(t => t.language === nativeLang)
    if (!translationRef) continue
    // Look up the translation unit
    const translationUnit = await unitRepository.findUnitOfMeaning(nativeLang, translationRef.content)
    if (!translationUnit) continue
    exercises.push({
      type: 'free-translation',
      front: unit.content,
      back: translationUnit.content
    })
  }
  return exercises
} 