import { db } from './dexieDB'
import type { ExerciseData } from '@/entities/ExerciseData'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'

/**
 * Dexie implementation of ExerciseDataRepository
 */
export function useRepoDexieExerciseData(): ExerciseDataRepository {
  return {
    /**
     * Adds a new exercise to the database
     */
    async addExercise(exercise: ExerciseData): Promise<void> {
      try {
        await db.exercises.add(exercise)
      } catch (error) {
        if (error instanceof Error && error.name === 'ConstraintError') {
          throw new Error(`Exercise with UID ${exercise.uid} already exists`)
        }
        throw error
      }
    },

    /**
     * Deletes an exercise by UID
     */
    async deleteExercise(uid: string): Promise<void> {
      await db.exercises.delete(uid)
    },

    /**
     * Finds an exercise by UID
     */
    async findExercise(uid: string): Promise<ExerciseData | null> {
      return await db.exercises.get(uid) || null
    },

    /**
     * Gets all exercises from the database
     */
    async getAllExercises(): Promise<ExerciseData[]> {
      return await db.exercises.toArray()
    },

    /**
     * Updates an existing exercise
     */
    async updateExercise(exercise: ExerciseData): Promise<void> {
      await db.exercises.put(exercise)
    }
  }
}
