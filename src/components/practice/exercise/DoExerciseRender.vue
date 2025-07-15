<template>
  <div>
    <h2 class="card-title justify-center mb-4 text-center">{{ exercise.instruction }}</h2>
    <component 
      :is="renderer" 
      :exercise="exercise"
      @learning-event="$emit('learning-event', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getExerciseRenderer } from './ExerciseRegistry'
import type { Exercise } from '@/entities/Exercises'

interface Props {
  exercise: Exercise
}

const props = defineProps<Props>()

/**
 * Get the appropriate renderer component for this exercise
 */
const renderer = computed(() => getExerciseRenderer(props.exercise))
</script> 