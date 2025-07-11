import type { ExerciseFlashcard } from "@/entities/ExerciseFlashcard"

export interface ExerciseRepository {
    addExercise(exercise: ExerciseFlashcard): Promise<void>
    deleteExercise(uid: string): Promise<void>
    findExercise(uid: string): Promise<ExerciseFlashcard | null>
    getAllExercises(): Promise<ExerciseFlashcard[]>
    updateExercise(exercise: ExerciseFlashcard): Promise<void>
}
