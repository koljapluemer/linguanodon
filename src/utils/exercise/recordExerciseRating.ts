import { fsrs, Rating } from 'ts-fsrs'
import type { ExerciseFlashcard } from '@/utils/exercise/types/ExerciseFlashcard'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'
import type { Grade } from 'ts-fsrs'

/**
 * Records exercise completion and updates card using ts-fsrs
 */
export async function recordExerciseRating(
  repository: ExerciseDataRepository,
  exercise: ExerciseFlashcard, 
  rating: Rating
): Promise<void> {
  const scheduler = fsrs() // default params
  const now = new Date()
  const { card: updatedCard } = scheduler.next(exercise.card, now, rating as Grade)
  
  const updatedExercise: ExerciseFlashcard = { 
    ...exercise, 
    card: updatedCard 
  }
  
  await repository.updateExercise(updatedExercise)
} 