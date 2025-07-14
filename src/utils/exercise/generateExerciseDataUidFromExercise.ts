import type { Exercise } from './types/exerciseTypes'

/**
 * Generates a predictable UID for an Exercise, based on its type and content.
 * This UID can be used to match ExerciseData to a generated Exercise.
 */
export function generateExerciseDataUidFromExercise(exercise: Exercise): string {
  switch (exercise.type) {
    case 'flashcard':
      // Use type, front, back
      return `flashcard_${hashString(exercise.front)}_${hashString(exercise.back)}`
    case 'choose-from-two':
      // Use type, front, correct/incorrect answers
      return `choose-from-two_${hashString(exercise.front)}_${hashString(exercise.correctAnswer)}_${hashString(exercise.incorrectAnswer)}`
    case 'free-translation':
      // Use type, front, back
      return `free-translation_${hashString(exercise.front)}_${hashString(exercise.back)}`
    default:
      throw new Error(`Unknown exercise type: ${(exercise as unknown as { type: string }).type}`)
  }
}

/**
 * Simple hash function for strings to keep UIDs readable but unique enough for practical use.
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
