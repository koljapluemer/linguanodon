import type { Exercise } from "@/entities/local/Exercises"
import type { Rating } from "ts-fsrs"

export interface ExerciseInteractionEvent {
  timestamp: Date
  exercise: Exercise
  fsrsRating: Rating
  userAnswer?: string
}
