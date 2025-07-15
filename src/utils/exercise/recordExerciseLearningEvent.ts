import { fsrs, createEmptyCard } from 'ts-fsrs'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'
import type { Grade } from 'ts-fsrs'
import type { ExerciseData } from '@/entities/ExerciseData'
import type { LearningEvent } from '@/entities/LearningEvent'

/**
 * Records exercise completion and updates card using ts-fsrs.
 * Finds or creates ExerciseData by UID, then updates the score and persists.
 */
export async function recordExerciseLearningEvent(
  repository: ExerciseDataRepository,
  event: LearningEvent
): Promise<void> {
  let exerciseData = await repository.findExercise(event.exercise.uid)
  if (!exerciseData) {
    exerciseData = { uid: event.exercise.uid, card: createEmptyCard() }
    await repository.addExercise(exerciseData)
  }
  const scheduler = fsrs() // default params
  const now = new Date()
  const { card: updatedCard } = scheduler.next(exerciseData.card, now, event.fsrsRating as Grade)
  const updatedExercise: ExerciseData = { 
    ...exerciseData, 
    card: updatedCard 
  }
  await repository.updateExercise(updatedExercise)
} 