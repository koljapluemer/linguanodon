import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
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
 * Generates a random incorrect answer based on the correct answer
 * This is a simple implementation - in a real app you might want more sophisticated logic
 */
function generateIncorrectAnswer(correctAnswer: string): string {
  // Simple strategy: add or remove a character, or use a similar word
  const variations = [
    correctAnswer + 's',
    correctAnswer.slice(0, -1),
    correctAnswer + 'ing',
    correctAnswer.replace(/[aeiou]/g, 'a'),
    correctAnswer.toUpperCase(),
    correctAnswer.toLowerCase()
  ]
  
  // Filter out variations that are too similar or empty
  const validVariations = variations.filter(v => 
    v.length > 2 && v !== correctAnswer && v.toLowerCase() !== correctAnswer.toLowerCase()
  )
  
  return validVariations.length > 0 
    ? validVariations[Math.floor(Math.random() * validVariations.length)]
    : correctAnswer + 'x' // Fallback
}

/**
 * Generates choose-from-two exercises for a unit of meaning in a specific language
 * The unit's content is clozed, and translations in the target language are shown as context
 */
export function generateChooseFromTwoForUnitAndLanguage(
  unit: UnitOfMeaning,
  targetLanguage: string
): ExerciseChooseFromTwo[] {
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
  wordIndexes.forEach((wordIdx) => {
    const word = tokens[wordIdx]
    if (word.length < 3) return
    
    // Create cloze version of the content
    const clozeContent = makeClozeTokens(tokens, wordIdx)
    
    // Show all translations in the target language as context
    const contextText = targetTranslations.map(ref => ref.content).join(' / ')
    
    // Generate incorrect answer
    const incorrectAnswer = generateIncorrectAnswer(word)
    
    exercises.push({
      uid: `choose_${unit.language}_${unit.content.replace(/[^a-zA-Z0-9]/g, '_')}_${wordIdx}_${targetLanguage}`,
      type: 'choose-from-two',
      front: wrapWithDirection(clozeContent),
      correctAnswer: word,
      incorrectAnswer: incorrectAnswer,
      context: contextText,
      card: createEmptyCard()
    })
  })
  
  return exercises
} 