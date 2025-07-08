<template>
  <ExerciseFlashcardRender
    :exercise="exercise"
    @score="onScore"
  />
</template>

<script setup lang="ts">
import ExerciseFlashcardRender from './ExerciseFlashcardRender.vue'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'

interface Props {
  exercise: ExerciseFlashcard
}

interface Emits {
  (e: 'score', score: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Forwards score event up to parent
 */
function onScore(score: string) {
  emit('score', score)
}
</script>
