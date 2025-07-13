import type { ExerciseData } from "@/entities/ExerciseData"

// Base interface for all exercises
export interface BaseExercise extends ExerciseData {
  type: string
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

// Union type for all exercise types
export type Exercise = ExerciseFlashcard | ExerciseChooseFromTwo

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