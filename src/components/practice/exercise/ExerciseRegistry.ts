import type { Component } from 'vue'
import type { Exercise } from '@/entities/Exercises'
import ExerciseChooseFromTwoControl from '@/components/practice/exercise/specific/choose-from-two/ExerciseChooseFromTwoControl.vue'
import ExerciseFlashcardControl from '@/components/practice/exercise/specific/flashcard/ExerciseFlashcardControl.vue'
import ExerciseFreeTranslationControl from '@/components/practice/exercise/specific/free-translation/ExerciseFreeTranslationControl.vue'

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