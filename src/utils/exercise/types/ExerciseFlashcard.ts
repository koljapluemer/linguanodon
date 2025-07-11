import type { ExerciseData } from "@/entities/ExerciseData";

export interface ExerciseFlashcard extends ExerciseData {
    front: string
    back: string
}