/**
 * Returns a mock in-memory repository for testing and development.
 */
import type { ExerciseFlashcard } from "@/entities/ExerciseFlashcard";
import type { ExerciseRepository } from "@/repositories/interfaces/ExerciseRepository";

/**
 * Use for dependency injection in tests or development to avoid real persistence.
 */
export function mockExerciseRepository(): ExerciseRepository {
    const dataSource: ExerciseFlashcard[] = [];

    return {
        /**
         * Adds an exercise to the mock store.
         */
        async addExercise(exercise: ExerciseFlashcard) {
            if (!dataSource.some(ex => ex.uid === exercise.uid)) {
                dataSource.push(exercise);
            }
            return Promise.resolve();
        },
        /**
         * Removes an exercise by UID.
         */
        async deleteExercise(uid: string) {
            const idx = dataSource.findIndex(ex => ex.uid === uid);
            if (idx !== -1) {
                dataSource.splice(idx, 1);
            }
            return Promise.resolve();
        },
        /**
         * Finds an exercise by UID, or returns null if not found.
         */
        async findExercise(uid: string) {
            return Promise.resolve(dataSource.find(ex => ex.uid === uid) || null);
        },
        /**
         * Returns all exercises.
         */
        async getAllExercises() {
            return Promise.resolve([...dataSource]);
        },
        /**
         * Updates an existing exercise.
         */
        async updateExercise(exercise: ExerciseFlashcard) {
            const idx = dataSource.findIndex(ex => ex.uid === exercise.uid);
            if (idx !== -1) {
                dataSource[idx] = exercise;
            }
            return Promise.resolve();
        }
    };
}
