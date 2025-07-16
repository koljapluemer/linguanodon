import { fsrs, createEmptyCard } from 'ts-fsrs'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'
import type { Grade } from 'ts-fsrs'
import type { ExerciseData } from '@/entities/ExerciseData'
import type { LearningEvent } from '@/entities/LearningEvent'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import { scoreUnitOfMeaning } from '@/utils/unitOfMeaning/scoreUnitOfMeaning'

/**
 * Records exercise completion and updates card using ts-fsrs.
 * Finds or creates ExerciseData by UID, then updates the score and persists.
 * Also scores the primary unit of meaning attached to the exercise.
 */
export async function recordExerciseLearningEvent(
  repository: ExerciseDataRepository,
  event: LearningEvent,
  unitRepository: UnitOfMeaningRepository
): Promise<void> {
  let exerciseData = await repository.findExercise(event.exercise.uid)
  if (!exerciseData) {
    exerciseData = { uid: event.exercise.uid, card: createEmptyCard() }
    await repository.addExercise(exerciseData)
  }
  const scheduler = fsrs() // default params
  const now = new Date()
  console.log('[recordExerciseLearningEvent] BEFORE', { card: exerciseData.card, event, rating: event.fsrsRating })
  const { card: updatedCard } = scheduler.next(exerciseData.card, now, event.fsrsRating as Grade)
  console.log('[recordExerciseLearningEvent] AFTER', { updatedCard })
  const updatedExercise: ExerciseData = { 
    ...exerciseData, 
    card: updatedCard 
  }
  await repository.updateExercise(updatedExercise)

  // Score the primary unit of meaning
  try {
    await scoreUnitOfMeaning(
      unitRepository,
      event.exercise.primaryUnitOfMeaning,
      event.fsrsRating as Grade
    )
  } catch (err) {
    console.error('Failed to score primary unit of meaning:', err)
  }
} 