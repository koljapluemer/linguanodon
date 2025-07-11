import type { Exercise } from "@/entities/Exercise"

export interface ExerciseRepository {
    addExercise(exercise: Exercise): Promise<void>
    deleteExercise(uid: string): Promise<void>
    findExercise(uid: string): Promise<Exercise | null>
    getAllExercises(): Promise<Exercise[]>
    updateExercise(exercise: Exercise): Promise<void>
}
