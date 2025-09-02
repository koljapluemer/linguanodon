import type { Card } from "ts-fsrs"

export interface LearningProgress extends Card {
  streak: number
  level: number
}