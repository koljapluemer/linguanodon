<template>
  <component 
    :is="renderer" 
    :exercise="exercise"
    @score="handleScore"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getExerciseRenderer } from './ExerciseRegistry'
import type { Exercise } from '@/utils/exercise/types/Exercise'
import { Rating } from 'ts-fsrs'

interface Props {
  exercise: Exercise
}

interface Emits {
  (e: 'score', exercise: Exercise, score: Rating): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Get the appropriate renderer component for this exercise
 */
const renderer = computed(() => getExerciseRenderer(props.exercise))

/**
 * Handle score events from child components
 */
function handleScore(score: Rating) {
  emit('score', props.exercise, score)
}
</script> 