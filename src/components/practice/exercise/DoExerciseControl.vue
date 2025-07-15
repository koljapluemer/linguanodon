<template>
  <DoExerciseRender
    :exercise="exercise"
    @score="handleScore"
  />
</template>

<script setup lang="ts">
import DoExerciseRender from './DoExerciseRender.vue'
import type { Exercise } from '@/entities/Exercises'
import { Rating } from 'ts-fsrs'

interface Props {
  exercise: Exercise
}

interface Emits {
  (e: 'exercise-finished', exercise: Exercise, score: Rating): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle scoring logic internally, then emit only 'exercise-finished'.
 */
function handleScore(score: Rating) {
  // Here you would handle any scoring logic, e.g. update local state, call a scoring util, etc.
  // For now, just emit the finished event.
  emit('exercise-finished', props.exercise, score)
}
</script> 