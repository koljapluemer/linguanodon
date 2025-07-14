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

interface Props {
  exercise: ExerciseChooseFromTwo
}

interface Emits {
  (e: 'score', exercise: ExerciseChooseFromTwo, score: Rating): void
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