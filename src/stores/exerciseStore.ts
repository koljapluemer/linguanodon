import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExerciseStore = defineStore('exercise', () => {
  const exerciseHistory = ref<Record<string, unknown>[]>([])

  /**
   * Records exercise completion (placeholder for future implementation)
   */
  function recordExerciseCompletion(exerciseData: Record<string, unknown>) {
    exerciseHistory.value.push({
      ...exerciseData,
      timestamp: new Date()
    })
  }

  return {
    exerciseHistory,
    recordExerciseCompletion
  }
}, {
  persist: true
})
