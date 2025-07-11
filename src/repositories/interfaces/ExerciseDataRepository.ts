import type { ExerciseData } from "@/entities/ExerciseData"

export interface ExerciseDataRepository {
    addExercise(exercise: ExerciseData): Promise<void>
    deleteExercise(uid: string): Promise<void>
    findExercise(uid: string): Promise<ExerciseData | null>
    getAllExercises(): Promise<ExerciseData[]>
    updateExercise(exercise: ExerciseData): Promise<void>
}
