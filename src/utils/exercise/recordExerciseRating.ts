import { fsrs, Rating } from 'ts-fsrs'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'
import type { Grade } from 'ts-fsrs'
import type { ExerciseData } from '@/entities/ExerciseData'

/**
 * Records exercise completion and updates card using ts-fsrs
 * This operates on ExerciseData, not pure Exercise.
 */
export async function recordExerciseRating(
  repository: ExerciseDataRepository,
  exercise: ExerciseData, 
  rating: Rating
): Promise<void> {
  const scheduler = fsrs() // default params
  const now = new Date()
  const { card: updatedCard } = scheduler.next(exercise.card, now, rating as Grade)
  
  const updatedExercise: ExerciseData = { 
    ...exercise, 
    card: updatedCard 
  }
  
  await repository.updateExercise(updatedExercise)
} 