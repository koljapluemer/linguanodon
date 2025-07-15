<template>
  <ExerciseChooseFromTwoRender
    :exercise="exercise"
    @score="onScore"
  />
</template>

<script setup lang="ts">
import { Rating } from 'ts-fsrs'
import type { LearningEvent } from '@/entities/LearningEvent'
import type { ExerciseChooseFromTwo } from '@/entities/Exercises'
import ExerciseChooseFromTwoRender from '@/components/practice/exercise/specific/choose-from-two/ExerciseChooseFromTwoRender.vue'

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