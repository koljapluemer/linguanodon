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
import { Rating } from 'ts-fsrs'
import type { LearningEvent } from '@/entities/LearningEvent'
import type { ExerciseFreeTranslation } from '@/entities/Exercises'
import ExerciseFreeTranslationRender from '@/components/practice/exercise/specific/free-translation/ExerciseFreeTranslationRender.vue'

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