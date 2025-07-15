<template>
  <ExerciseChooseFromTwoRender
    :exercise="exercise"
    @score="onScore"
  />
</template>

<script setup lang="ts">
import ExerciseChooseFromTwoRender from './ExerciseChooseFromTwoRender.vue'
import type { ExerciseChooseFromTwo } from '@/utils/exercise/types/exerciseTypes'
import { Rating } from 'ts-fsrs'
import type { LearningEvent } from '@/entities/LearningEvent'

interface Props {
  exercise: ExerciseChooseFromTwo
}

interface Emits {
  (e: 'learning-event', event: LearningEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Forwards score event up to parent
 */
function onScore(score: Rating) {
  emit('learning-event', {
    timestamp: new Date(),
    exercise: props.exercise,
    fsrsRating: score
  })
}
</script> 