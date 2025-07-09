export interface Task {
    language: string;
    content: string;
    unitsOfMeaning: string[] // list of uids
    primaryUnitsOfMeaning: string[] // list of uids
    lastDownloadedAt: Date | null
    lastPracticedAt: Date | null
    isCompleted: boolean
    nextShownEarliestAt: Date
    interval: number
    attempts: TaskAttempt[]
}

export interface TaskAttempt {
    ease: number
    correctness: number
    timestamp: Date
}