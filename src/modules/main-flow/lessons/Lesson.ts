import type { ExerciseProgress } from "../exercises/user-progress/ExerciseProgress"

export interface Lesson {
    exercises: ExerciseProgress[]
    
    // a dictionary of learning goal ids, with each value being how often
    // the learning goal was used in the lesson
    learningGoalUsages: Record<number, number>
}