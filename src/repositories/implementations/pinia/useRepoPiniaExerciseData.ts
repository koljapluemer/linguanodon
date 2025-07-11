import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ExerciseData } from '@/entities/ExerciseData'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'

const useExerciseDataStore = defineStore('exerciseData', () => {
  const exercises = ref<Record<string, ExerciseData>>({})

  /**
   * Adds an exercise to the store
   */
  function addExercise(exercise: ExerciseData) {
    exercises.value[exercise.uid] = exercise
  }

  /**
   * Deletes an exercise by UID
   */
  function deleteExercise(uid: string) {
    delete exercises.value[uid]
  }

  /**
   * Finds an exercise by UID
   */
  function findExercise(uid: string): ExerciseData | null {
    return exercises.value[uid] || null
  }

  /**
   * Gets all exercises
   */
  function getAllExercises(): ExerciseData[] {
    return Object.values(exercises.value)
  }

  /**
   * Updates an existing exercise
   */
  function updateExercise(exercise: ExerciseData) {
    exercises.value[exercise.uid] = exercise
  }

  return {
    addExercise,
    deleteExercise,
    findExercise,
    getAllExercises,
    updateExercise
  }
}, {
  persist: true
})

/**
 * Pinia-backed implementation of ExerciseRepository
 */
export const piniaExerciseRepository: ExerciseDataRepository = {
  /**
   * Adds an exercise to the store
   */
  async addExercise(exercise: ExerciseData) {
    useExerciseStore().addExercise(exercise)
    return Promise.resolve()
  },
  /**
   * Deletes an exercise by UID
   */
  async deleteExercise(uid: string) {
    useExerciseStore().deleteExercise(uid)
    return Promise.resolve()
  },
  /**
   * Finds an exercise by UID
   */
  async findExercise(uid: string) {
    return Promise.resolve(useExerciseStore().findExercise(uid))
  },
  /**
   * Gets all exercises
   */
  async getAllExercises() {
    return Promise.resolve(useExerciseStore().getAllExercises())
  },
  /**
   * Updates an existing exercise
   */
  async updateExercise(exercise: ExerciseData) {
    useExerciseStore().updateExercise(exercise)
    return Promise.resolve()
  }
}
