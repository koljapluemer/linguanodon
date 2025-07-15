import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseChooseFromTwo } from '@/utils/exercise/types/exerciseTypes'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'
import { splitIntoTokens } from '@/utils/exercise/utils/splitIntoTokens'
import { isWordToken } from '@/utils/exercise/utils/isWordToken'
import { makeClozeTokens } from '@/utils/exercise/utils/makeClozeTokens'
import { wrapWithDirection } from '@/utils/exercise/utils/wrapWithDirection'

/**
 * Calculates the Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Finds a suitable incorrect answer from the unit repository
 */
async function findIncorrectAnswer(
  correctAnswer: string,
  language: string,
  unitRepository: UnitOfMeaningRepository
): Promise<string> {
  try {
    // Get all units in the same language
    const allUnits = await unitRepository.getAllUnitsOfMeaningByLanguage(language)
    
    // Filter units that meet our criteria
    const candidates = allUnits.filter(unit => {
      const content = unit.content
      
      // Skip if it's the same as correct answer
      if (content.toLowerCase() === correctAnswer.toLowerCase()) return false
      
      // Check length constraints (not more than 50% shorter or longer)
      const lengthRatio = content.length / correctAnswer.length
      if (lengthRatio < 0.5 || lengthRatio > 1.5) return false
      
      // Check string distance (at least 2)
      const distance = levenshteinDistance(content.toLowerCase(), correctAnswer.toLowerCase())
      if (distance < 2) return false
      
      return true
    })
    
    // If we have candidates, pick a random one
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length)
      return candidates[randomIndex].content
    }
    
    // Fallback: generate a simple variation if no suitable candidates found
    return correctAnswer + 'x'
  } catch (error) {
    console.warn('Failed to find incorrect answer from repository:', error)
    // Fallback: generate a simple variation
    return correctAnswer + 'x'
  }
}

/**
 * Generates choose-from-two exercises for a unit of meaning in a specific language
 * Creates exercises in both directions:
 * 1. Original content clozed, translation as hint
 * 2. Translation clozed, original content as hint
 */
export async function generateChooseFromTwoForUnitAndLanguage(
  unit: UnitOfMeaning,
  targetLanguage: string,
  unitRepository: UnitOfMeaningRepository
): Promise<ExerciseChooseFromTwo[]> {
  const exercises: ExerciseChooseFromTwo[] = []
  
  // Find translations in the target language
  const targetTranslations = unit.translations.filter(ref => ref.language === targetLanguage)
  
  if (targetTranslations.length === 0) {
    return []
  }
  
  // Only generate exercises for clozing the target language translations
  for (const translation of targetTranslations) {
    const translationTokens = splitIntoTokens(translation.content)
    const translationWordIndexes = translationTokens.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)
    
    if (translationWordIndexes.length <= 1) continue
    
    for (const wordIdx of translationWordIndexes) {
      const word = translationTokens[wordIdx]
      if (word.length < 3) continue
      
      // Create cloze version of the translation
      const clozeContent = makeClozeTokens(translationTokens, wordIdx)
      
      // Show original content as context
      const contextText = unit.content
      
      // Find incorrect answer from repository
      const incorrectAnswer = await findIncorrectAnswer(word, translation.language, unitRepository)
      // Try to find a translation ref for the incorrect answer (if it exists in this unit's translations)
      const incorrectRef = unit.translations.find(t => t.language === translation.language && t.content === incorrectAnswer)
      const secondaryUnits: UnitOfMeaningIdentification[] = [
        { language: translation.language, content: translation.content }
      ]
      if (incorrectRef) {
        secondaryUnits.push({ language: incorrectRef.language, content: incorrectRef.content })
      }
      exercises.push({
        type: 'choose-from-two',
        front: wrapWithDirection(clozeContent),
        correctAnswer: word,
        incorrectAnswer: incorrectAnswer,
        context: contextText,
        instruction: 'Fill in the blank with the correct word',
        primaryUnitOfMeaning: { language: unit.language, content: unit.content },
        secondaryUnitsOfMeaning: secondaryUnits
      })
    }
  }
  
  return exercises
} 