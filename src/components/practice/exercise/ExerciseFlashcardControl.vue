<template>
  <ExerciseFlashcardRender
    :exercise="exercise"
    @score="onScore"
  />
</template>

<script setup lang="ts">
import ExerciseFlashcardRender from './ExerciseFlashcardRender.vue'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import { Rating } from 'ts-fsrs'

interface Props {
  exercise: ExerciseFlashcard
}

interface Emits {
  (e: 'score', exercise: ExerciseFlashcard, score: Rating): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Forwards score event up to parent
 */
function onScore(score: Rating) {
  emit('score', props.exercise, score)
}
</script>
