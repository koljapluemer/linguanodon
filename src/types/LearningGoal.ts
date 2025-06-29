export interface LearningGoal {
    id?: number
    unitsOfMeaning: number[] // array of unit-of-meaning ids
    parents: number[] // array of learning-goal ids
}