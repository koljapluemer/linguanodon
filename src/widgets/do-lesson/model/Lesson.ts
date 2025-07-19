import type { Exercise } from "./Exercise";

/**
 * Represents a complete lesson with multiple exercises.
 * Lessons are generated dynamically and not persisted.
 */
export interface Lesson {
  /** Unique identifier for this lesson */
  id: string;
  
  /** All exercises in this lesson */
  exercises: Exercise[];
  
  /** Current exercise index (0-based) */
  currentExerciseIndex: number;
  
  /** Whether the lesson is completed */
  isCompleted: boolean;
  
  /** When this lesson was created */
  createdAt: Date;
  
  /** When this lesson was completed (if completed) */
  completedAt?: Date;
}