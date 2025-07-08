import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import { createEmptyCard } from 'ts-fsrs'

/**
 * Splits a sentence into words, handling any language
 */
function splitIntoWords(sentence: string): string[] {
  // Remove punctuation and split by whitespace
  return sentence.replace(/[.,!?;:]/g, '').trim().split(/\s+/)
}

/**
 * Creates cloze placeholders based on language direction
 */
function getClozePlaceholder(language: string): string {
  // Use RTL-aware placeholder for RTL languages, LTR for others
  return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(language) ? '؟؟؟' : '???'
}

/**
 * Determines if a language is RTL based on Unicode ranges
 */
function isRTL(language: string): boolean {
  return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(language)
}

/**
 * Wraps text in appropriate dir attribute based on language
 */
function wrapWithDirection(text: string, language: string): string {
  const direction = isRTL(language) ? 'rtl' : 'ltr'
  return `<div dir="${direction}">${text}</div>`
}

/**
 * Generates all possible clozes for a sentence-translation pair
 * Creates variations for both target->native and native->target directions
 */
function generateClozesForPair(unit1: UnitOfMeaning, unit2: UnitOfMeaning): ExerciseFlashcard[] {
  const exercises: ExerciseFlashcard[] = []
  
  // Generate clozes for unit1 (target language)
  const words1 = splitIntoWords(unit1.content)
  if (words1.length > 1) {
    words1.forEach((word, index) => {
      // Skip words with less than 3 characters
      if (word.length <= 3) return
      
      const clozePlaceholder = getClozePlaceholder(unit1.language)
      const clozeWords = [...words1]
      clozeWords[index] = clozePlaceholder
      
      // Front: target lang sentence with cloze, <br>, native sentence
      const front = `${wrapWithDirection(clozeWords.join(' '), unit1.language)}<div class="text-2xl">${wrapWithDirection(unit2.content, unit2.language)}</div>`
      // Back: target lang sentence "unclozed", with <mark> surrounding the word that was clozed, <br>, native sentence
      const back = `${wrapWithDirection(unit1.content.replace(word, `<mark>${word}</mark>`), unit1.language)}<div class="text-2xl">${wrapWithDirection(unit2.content, unit2.language)}</div>`
      
      exercises.push({
        uid: `cloze_${unit1.uid}_${index}`,
        front,
        back,
        card: createEmptyCard()
      })
    })
  }
  
  // Generate clozes for unit2 (native language)
  const words2 = splitIntoWords(unit2.content)
  if (words2.length > 1) {
    words2.forEach((word, index) => {
      // Skip words with less than 3 characters
      if (word.length <= 3) return
      
      const clozePlaceholder = getClozePlaceholder(unit2.language)
      const clozeWords = [...words2]
      clozeWords[index] = clozePlaceholder
      
      // Front: native sentence with cloze, <br>, target lang sentence
      const front = `${wrapWithDirection(clozeWords.join(' '), unit2.language)}<div class="text-2xl">${wrapWithDirection(unit1.content, unit1.language)}</div>`
      // Back: native sentence "unclozed", with <mark> surrounding the word that was clozed, <br>, target lang sentence
      const back = `${wrapWithDirection(unit2.content.replace(word, `<mark>${word}</mark>`), unit2.language)}<div class="text-2xl">${wrapWithDirection(unit1.content, unit1.language)}</div>`
      
      exercises.push({
        uid: `cloze_${unit2.uid}_${index}`,
        front,
        back,
        card: createEmptyCard()
      })
    })
  }
  
  return exercises
}

/**
 * Groups units of meaning into translation pairs
 */
function groupIntoPairs(units: UnitOfMeaning[]): UnitOfMeaning[][] {
  const pairs: UnitOfMeaning[][] = []
  const processed = new Set<string>()
  
  units.forEach(unit => {
    if (processed.has(unit.uid)) return
    
    // Find translation pair
    const pair = [unit]
    unit.translations.forEach(translationUid => {
      const translation = units.find(u => u.uid === translationUid)
      if (translation && !processed.has(translation.uid)) {
        pair.push(translation)
        processed.add(translation.uid)
      }
    })
    
    if (pair.length === 2) {
      pairs.push(pair)
    }
    
    processed.add(unit.uid)
  })
  
  return pairs
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generates cloze-based flashcard exercises from units of meaning
 * Returns 20 randomly selected and shuffled exercises
 */
export function generateExercises(units: UnitOfMeaning[]): ExerciseFlashcard[] {
  const pairs = groupIntoPairs(units)
  const allExercises: ExerciseFlashcard[] = []
  
  // Generate clozes for each pair
  pairs.forEach(([unit1, unit2]) => {
    const pairExercises = generateClozesForPair(unit1, unit2)
    allExercises.push(...pairExercises)
  })
  
  // Shuffle and select 20 exercises
  const shuffled = shuffleArray(allExercises)
  return shuffled.slice(0, 20)
}
