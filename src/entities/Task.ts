export interface Task {
    content: string;
    unitsOfMeaning: string[] // list of uids
    lastDownloadedAt?: Date
    lastPracticedAt?: Date
    isCompleted: boolean
    nextShownEarliestAt?: Date
    interval: number
    attempts: TaskAttempt[]
}

export interface TaskAttempt {
    ease: number
    correctness: number
    timestamp: Date
}