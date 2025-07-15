import type { UnitOfMeaning } from "@/entities/UnitOfMeaning"

// Base interface for all exercises
export interface BaseExercise {
  type: string
  instruction: string
  primaryUnitOfMeaning: UnitOfMeaning
  secondaryUnitsOfMeaning: UnitOfMeaning[]
}

// Flashcard exercise type
export interface ExerciseFlashcard extends BaseExercise {
  type: 'flashcard'
  front: string
  back: string
}

// Choose from two exercise type
export interface ExerciseChooseFromTwo extends BaseExercise {
  type: 'choose-from-two'
  front: string
  correctAnswer: string
  incorrectAnswer: string
  context: string
}

// Free-translation exercise type
export interface ExerciseFreeTranslation extends BaseExercise {
  type: 'free-translation'
  front: string // target language sentence
  back: string  // native language sentence
}

// Union type for all exercise types
export type Exercise = ExerciseFlashcard | ExerciseChooseFromTwo | ExerciseFreeTranslation

// Type guard functions
/**
 * Type guard to check if an exercise is a flashcard exercise
 */
export function isFlashcardExercise(exercise: Exercise): exercise is ExerciseFlashcard {
  return exercise.type === 'flashcard'
}

/**
 * Type guard to check if an exercise is a choose-from-two exercise
 */
export function isChooseFromTwoExercise(exercise: Exercise): exercise is ExerciseChooseFromTwo {
  return exercise.type === 'choose-from-two'
}

/**
 * Type guard to check if an exercise is a free-translation exercise
 */
export function isFreeTranslationExercise(exercise: Exercise): exercise is ExerciseFreeTranslation {
  return exercise.type === 'free-translation'
}