import type { Exercise } from "@/entities/Exercise";

export interface ExerciseFlashcard extends Exercise {
    front: string
    back: string
}