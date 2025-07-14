<template>
  <ExerciseFreeTranslationRender
    :exercise="exercise"
    @score="onScore"
  />
</template>

/**
 * Controller component for free-translation exercises. Forwards score events up to parent.
 */
<script setup lang="ts">
import ExerciseFreeTranslationRender from './ExerciseFreeTranslationRender.vue'
import type { ExerciseFreeTranslation } from '@/utils/exercise/types/exerciseTypes'
import { Rating } from 'ts-fsrs'

interface Props {
  exercise: ExerciseFreeTranslation
}

interface Emits {
  (e: 'score', exercise: ExerciseFreeTranslation, score: Rating): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Emits score event with the exercise and selected rating.
 */
function onScore(score: Rating) {
  emit('score', props.exercise, score)
}
</script> 