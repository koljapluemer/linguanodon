export interface LearningGoal {
    uid: string
    name: string
    parents: string[] // array of learning-goal uids
    blockedBy: string[] // array of learning-goal uids
    language: string // is Language.tag
    unitsOfMeaning: string[] // array of unit-of-meaning uids
    userCreated: boolean
}

export interface LearningGoalSummary {
    uid: string
    name: string
}