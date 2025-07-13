import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseChooseFromTwo } from '@/utils/exercise/types/Exercise'
import { createEmptyCard } from 'ts-fsrs'

/**
 * Splits a sentence into tokens: words and punctuation, preserving order
 */
function splitIntoTokens(sentence: string): string[] {
  // Match words (\p{L} = any letter, \p{N} = any number), or punctuation, or whitespace
  // This will keep punctuation as separate tokens
  return sentence.match(/\p{L}+[\p{N}\p{L}''-]*|[.,!?;:،؟…-]+|\s+/gu) || []
}

/**
 * Determines if a token is a word (not punctuation or whitespace)
 */
function isWordToken(token: string): boolean {
  // Word if it contains at least one letter or number
  return /[\p{L}\p{N}]/u.test(token)
}

/**
 * Creates cloze placeholders based on token direction (no span, just the placeholder string)
 */
function getClozePlaceholder(token: string): string {
  const dir = detectTextDirection(token)
  return dir === 'rtl' ? '؟؟؟' : '???'
}

/**
 * Wraps text in appropriate dir attribute based on detected direction of the text
 */
function wrapWithDirection(text: string): string {
  const direction = detectTextDirection(text)
  return `<div dir="${direction}">${text}</div>`
}

/**
 * Replace the word token at wordIdx with a cloze placeholder, preserving punctuation and spacing.
 */
function makeClozeTokens(tokens: string[], wordIdx: number): string {
  const clozeTokens = [...tokens]
  clozeTokens[wordIdx] = getClozePlaceholder(tokens[wordIdx])
  return clozeTokens.join('')
}

/**
 * Detect text direction ('rtl' or 'ltr') by majority vote of characters
 */
function detectTextDirection(text: string): 'rtl' | 'ltr' {
  let rtl = 0, ltr = 0
  for (const char of text) {
    if (/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char)) rtl++
    else if (/[A-Za-z\u0041-\u007A\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/.test(char)) ltr++
  }
  // If more rtl, return 'rtl', else 'ltr'
  return rtl > ltr ? 'rtl' : 'ltr'
}

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
  
  // Generate clozes for the unit's content (the main content gets clozed)
  const tokens = splitIntoTokens(unit.content)
  const wordIndexes = tokens.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)
  
  if (wordIndexes.length <= 1) {
    return []
  }
  
  // Create one exercise per word (excluding very short words)
  for (const wordIdx of wordIndexes) {
    const word = tokens[wordIdx]
    if (word.length < 3) continue
    
    // Create cloze version of the content
    const clozeContent = makeClozeTokens(tokens, wordIdx)
    
    // Show all translations in the target language as context
    const contextText = targetTranslations.map(ref => ref.content).join(' / ')
    
    // Find incorrect answer from repository
    const incorrectAnswer = await findIncorrectAnswer(word, unit.language, unitRepository)
    
    exercises.push({
      uid: `choose_${unit.language}_${unit.content.replace(/[^a-zA-Z0-9]/g, '_')}_${wordIdx}_${targetLanguage}`,
      type: 'choose-from-two',
      front: wrapWithDirection(clozeContent),
      correctAnswer: word,
      incorrectAnswer: incorrectAnswer,
      context: contextText,
      card: createEmptyCard()
    })
  }
  
  // Generate reverse exercises: clozing the translations
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
      
      exercises.push({
        uid: `choose_${translation.language}_${translation.content.replace(/[^a-zA-Z0-9]/g, '_')}_${wordIdx}_${unit.language}`,
        type: 'choose-from-two',
        front: wrapWithDirection(clozeContent),
        correctAnswer: word,
        incorrectAnswer: incorrectAnswer,
        context: contextText,
        card: createEmptyCard()
      })
    }
  }
  
  return exercises
} 