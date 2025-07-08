import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fsrs, Rating } from 'ts-fsrs'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import type { Grade } from 'ts-fsrs'

export const useExerciseStore = defineStore('exercise', () => {
  const exercises = ref<Record<string, ExerciseFlashcard>>({})
  const scheduler = fsrs() // default params

  /**
   * Records exercise completion and updates card using ts-fsrs
   */
  function recordExerciseRating(exercise: ExerciseFlashcard, rating: Rating) {
    const now = new Date()
    const { card: updatedCard } = scheduler.next(exercise.card, now, rating as Grade)
    exercises.value[exercise.uid] = { ...exercise, card: updatedCard }
  }

  return {
    exercises,
    recordExerciseRating
  }
}, {
  persist: true
})
