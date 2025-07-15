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
  if (unit.language !== targetLanguageCode) {
    console.debug('[FreeTranslation] Skipping unit because language does not match target:', {unitLanguage: unit.language, targetLanguageCode})
    return []
  }

  // Count words in the target sentence
  const tokens = splitIntoTokens(unit.content)
  const wordCount = tokens.filter(isWordToken).length
  if (wordCount < 3) {
    console.debug('[FreeTranslation] Skipping unit because word count < 3:', {unitContent: unit.content, wordCount})
    return []
  }

  // For each native language, find the translation and create the exercise
  const exercises: ExerciseFreeTranslation[] = []
  for (const nativeLang of nativeLanguageCodes) {
    const translationRef = unit.translations.find(t => t.language === nativeLang)
    if (!translationRef) {
      console.debug('[FreeTranslation] No translationRef found for native language:', {nativeLang, availableTranslations: unit.translations})
      continue
    }
    // Look up the translation unit
    const translationUnit = await unitRepository.findUnitOfMeaning(nativeLang, translationRef.content)
    if (!translationUnit) {
      console.debug('[FreeTranslation] No translationUnit found in DB for:', {nativeLang, content: translationRef.content})
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
  if (exercises.length === 0) {
    console.debug('[FreeTranslation] No exercises generated for unit:', {unit})
  }
  return exercises
} 