import type { Exercise } from "@/entities/Exercises"
import type { Rating } from "ts-fsrs"

export interface LearningEvent {
  timestamp: Date
  exercise: Exercise
  fsrsRating: Rating
  userAnswer?: string
}
