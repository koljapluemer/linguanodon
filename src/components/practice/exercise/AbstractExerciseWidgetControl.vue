<template>
  <component
    v-if="widgetComponent && widgetProps"
    :is="widgetComponent"
    v-bind="widgetProps"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Exercise } from '@/entities/Exercises'
import { isFlashcardExercise, isChooseFromTwoExercise, isFreeTranslationExercise } from '@/entities/Exercises'
import ExerciseFlashcardWidget from '@/components/practice/exercise/specific/flashcard/ExerciseFlashcardWidget.vue'
import ExerciseChooseFromTwoWidget from '@/components/practice/exercise/specific/choose-from-two/ExerciseChooseFromTwoWidget.vue'
import ExerciseFreeTranslationWidget from '@/components/practice/exercise/specific/free-translation/ExerciseFreeTranslationWidget.vue'

const props = defineProps<{ exercise: Exercise }>()

const widgetComponent = computed(() => {
  if (isFlashcardExercise(props.exercise)) {
    return ExerciseFlashcardWidget
  } else if (isChooseFromTwoExercise(props.exercise)) {
    return ExerciseChooseFromTwoWidget
  } else if (isFreeTranslationExercise(props.exercise)) {
    return ExerciseFreeTranslationWidget
  }
  return null
})

const widgetProps = computed(() => {
  if (isFlashcardExercise(props.exercise)) {
    return { exercise: props.exercise }
  } else if (isChooseFromTwoExercise(props.exercise)) {
    return { exercise: props.exercise }
  } else if (isFreeTranslationExercise(props.exercise)) {
    return { exercise: props.exercise }
  }
  return null
})
</script>
