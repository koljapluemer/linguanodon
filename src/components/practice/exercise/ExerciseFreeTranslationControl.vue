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
import type { LearningEvent } from '@/entities/LearningEvent'

interface Props {
  exercise: ExerciseFreeTranslation
}

interface Emits {
  (e: 'learning-event', event: LearningEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Emits score event with the exercise and selected rating.
 */
function onScore(score: Rating) {
  emit('learning-event', {
    timestamp: new Date(),
    exercise: props.exercise,
    fsrsRating: score
  })
}
</script> 