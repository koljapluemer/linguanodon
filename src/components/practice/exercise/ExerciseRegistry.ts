import type { Component } from 'vue'
import ExerciseFlashcardControl from './ExerciseFlashcardControl.vue'
import ExerciseChooseFromTwoControl from './ExerciseChooseFromTwoControl.vue'
import ExerciseFreeTranslationControl from './ExerciseFreeTranslationControl.vue'
import type { Exercise } from '@/utils/exercise/types/exerciseTypes'

/**
 * Registry mapping exercise types to their renderer components
 */
export const exerciseRenderers = {
  flashcard: ExerciseFlashcardControl,
  'choose-from-two': ExerciseChooseFromTwoControl,
  'free-translation': ExerciseFreeTranslationControl
} as const

/**
 * Type for exercise type keys
 */
export type ExerciseType = keyof typeof exerciseRenderers

/**
 * Get the appropriate renderer component for an exercise
 */
export function getExerciseRenderer(exercise: Exercise): Component {
  return exerciseRenderers[exercise.type as ExerciseType]
} 