import type { Exercise } from "./Exercise";

export interface Lesson {
    exercises: Exercise[]
    
    // a dictionary of learning goal ids, with each value being how often
    // the learning goal was used in the lesson
    learningGoalUsages: Record<number, number>
}