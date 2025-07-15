/**
 * Utility for generating predictable UIDs and human-readable labels for exercises, for matching ExerciseData to generated exercises.
 */
import type { Exercise } from './types/exerciseTypes'
import type { ExerciseGeneratorInterface } from './generators/ExerciseGeneratorInterface'

/**
 * Simple hash function for generating readable, unique-enough strings for UIDs.
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Generator-like utility for UID and label generation for exercises. Only getUid is implemented.
 */
export const exerciseDataUidGenerator: ExerciseGeneratorInterface<[Exercise]> = {
  /**
   * Not implemented: Only getUid is supported for this utility.
   */
  generateExercises: () => { throw new Error('Not implemented: Only getUid is supported for this utility.') },
  /**
   * Returns a predictable UID and human-readable label for a given exercise.
   */
  getUid: (exercise: Exercise) => {
    switch (exercise.type) {
      case 'flashcard':
        return {
          uid: `flashcard_${hashString(exercise.front)}_${hashString(exercise.back)}`,
          humanReadable: `Flashcard: ${exercise.primaryUnitOfMeaning?.language ?? ''} | ${exercise.front}`
        }
      case 'choose-from-two':
        return {
          uid: `choose-from-two_${hashString(exercise.front)}_${hashString(exercise.correctAnswer)}_${hashString(exercise.incorrectAnswer)}`,
          humanReadable: `ChooseFromTwo: ${exercise.primaryUnitOfMeaning?.language ?? ''} | ${exercise.front}`
        }
      case 'free-translation':
        return {
          uid: `free-translation_${hashString(exercise.front)}_${hashString(exercise.back)}`,
          humanReadable: `FreeTranslation: ${exercise.primaryUnitOfMeaning?.language ?? ''} | ${exercise.front}`
        }
      default:
        throw new Error(`Unknown exercise type: ${(exercise as unknown as { type: string }).type}`)
    }
  }
}
