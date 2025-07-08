import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import { createEmptyCard } from 'ts-fsrs'
import { useExerciseStore } from '@/stores/exerciseStore'

/**
 * Splits a sentence into tokens: words and punctuation, preserving order
 */
function splitIntoTokens(sentence: string): string[] {
  // Match words (\p{L} = any letter, \p{N} = any number), or punctuation, or whitespace
  // This will keep punctuation as separate tokens
  return sentence.match(/\p{L}+[\p{N}\p{L}'’-]*|[.,!?;:،؟…-]+|\s+/gu) || []
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
export function makeClozeTokens(tokens: string[], wordIdx: number): string {
  const clozeTokens = [...tokens]
  clozeTokens[wordIdx] = getClozePlaceholder(tokens[wordIdx])
  return clozeTokens.join('')
}

/**
 * Generates all possible clozes for a sentence-translation pair
 * Creates variations for both target->native and native->target directions
 */
function generateClozesForPair(unit1: UnitOfMeaning, unit2: UnitOfMeaning): ExerciseFlashcard[] {
  const exercises: ExerciseFlashcard[] = []
  
  // Generate clozes for unit1 (target language)
  const tokens1 = splitIntoTokens(unit1.content)
  const wordIndexes1 = tokens1.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)
  if (wordIndexes1.length > 1) {
    wordIndexes1.forEach((wordIdx) => {
      const word = tokens1[wordIdx]
      if (word.length < 3) return
      const front = `${wrapWithDirection(makeClozeTokens(tokens1, wordIdx))}<div class="text-2xl">${wrapWithDirection(unit2.content)}</div>`
      const back = `${wrapWithDirection(unit1.content.replace(word, `<mark>${word}</mark>`))}<div class="text-2xl">${wrapWithDirection(unit2.content)}</div>`
      exercises.push({
        uid: `cloze_${unit1.uid}_${wordIdx}`,
        front,
        back,
        card: createEmptyCard()
      })
    })
  }
  
  // Generate clozes for unit2 (native language)
  const tokens2 = splitIntoTokens(unit2.content)
  const wordIndexes2 = tokens2.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)
  if (wordIndexes2.length > 1) {
    wordIndexes2.forEach((wordIdx) => {
      const word = tokens2[wordIdx]
      if (word.length < 3) return
      const front = `${wrapWithDirection(makeClozeTokens(tokens2, wordIdx))}<div class="text-2xl">${wrapWithDirection(unit1.content)}</div>`
      const back = `${wrapWithDirection(unit2.content.replace(word, `<mark>${word}</mark>`))}<div class="text-2xl">${wrapWithDirection(unit1.content)}</div>`
      exercises.push({
        uid: `cloze_${unit2.uid}_${wordIdx}`,
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
 * Categorize exercises as due, new, or not due
 */
function categorizeExercises(
  exercises: ExerciseFlashcard[],
  storeExercises: Record<string, ExerciseFlashcard>
) {
  const now = new Date()
  const due: ExerciseFlashcard[] = []
  const newExercises: ExerciseFlashcard[] = []
  const notDue: ExerciseFlashcard[] = []

  for (const ex of exercises) {
    const stored = storeExercises[ex.uid]
    if (!stored) {
      newExercises.push(ex)
    } else if (stored.card && stored.card.due && new Date(stored.card.due) <= now) {
      due.push({ ...ex, card: stored.card })
    } else if (stored.card && stored.card.due && new Date(stored.card.due) > now) {
      notDue.push({ ...ex, card: stored.card })
    } else {
      newExercises.push(ex)
    }
  }
  return { due, newExercises, notDue }
}

/**
 * Select up to 20 exercises: due > new > not due (by soonest due date)
 */
function pickSessionExercises(
  allExercises: ExerciseFlashcard[],
  storeExercises: Record<string, ExerciseFlashcard>
): ExerciseFlashcard[] {
  const { due, newExercises, notDue } = categorizeExercises(allExercises, storeExercises)
  console.info(
    `Exercise selection: due=${due.length}, new=${newExercises.length}, not due=${notDue.length}`
  )
  const result: ExerciseFlashcard[] = []
  // 1. Fill with due (random if more than 20)
  if (due.length >= 20) {
    return shuffleArray(due).slice(0, 20)
  }
  result.push(...shuffleArray(due))
  // 2. Fill with new
  if (result.length < 20) {
    const needed = 20 - result.length
    result.push(...shuffleArray(newExercises).slice(0, needed))
  }
  // 3. Fill with not due (sorted by due date)
  if (result.length < 20) {
    const needed = 20 - result.length
    const sortedNotDue = [...notDue].sort((a, b) => new Date(a.card.due).getTime() - new Date(b.card.due).getTime())
    result.push(...sortedNotDue.slice(0, needed))
  }
  // 4. If fewer than 20 total, just return all available
  return result
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
  
  // Use store to select session exercises
  const store = useExerciseStore()
  return pickSessionExercises(allExercises, store.exercises)
}

/**
 * Detect text direction ('rtl' or 'ltr') by majority vote of characters
 */
export function detectTextDirection(text: string): 'rtl' | 'ltr' {
  let rtl = 0, ltr = 0
  for (const char of text) {
    if (/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char)) rtl++
    else if (/[A-Za-z\u0041-\u007A\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/.test(char)) ltr++
  }
  // If more rtl, return 'rtl', else 'ltr'
  return rtl > ltr ? 'rtl' : 'ltr'
}
