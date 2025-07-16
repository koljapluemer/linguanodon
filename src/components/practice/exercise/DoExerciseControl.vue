<template>
  <DoExerciseRender
    :exercise="exercise"
    @learning-event="handleLearningEvent"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import DoExerciseRender from './DoExerciseRender.vue'
import type { Exercise } from '@/entities/Exercises'
import { exerciseRepositoryKey } from '@/types/injectionKeys'
import { unitOfMeaningRepositoryKey } from '@/types/injectionKeys'
import { recordExerciseLearningEvent } from '@/utils/exercise/recordExerciseLearningEvent'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'
import type { LearningEvent } from '@/entities/LearningEvent'

interface Props {
  exercise: Exercise
}

interface Emits {
  (e: 'exercise-finished', event: LearningEvent): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const exerciseRepository = inject<ExerciseDataRepository>(exerciseRepositoryKey)
const unitRepository = inject(unitOfMeaningRepositoryKey)

/**
 * Handles the learning-event from the exercise, persists the result, and emits exercise-finished.
 */
async function handleLearningEvent(event: LearningEvent) {
  try {
    if (!exerciseRepository) {
      throw new Error('ExerciseDataRepository not provided')
    }
    if (!unitRepository) {
      throw new Error('UnitOfMeaningRepository not provided')
    }
    await recordExerciseLearningEvent(exerciseRepository, event, unitRepository)
    emit('exercise-finished', event)
  } catch (err) {
    console.error('[DoExerciseControl] Error in handleLearningEvent:', err)
    emit('exercise-finished', event)
  }
}
</script> 