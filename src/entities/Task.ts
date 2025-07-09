export interface Task {
    language: string;
    content: string;
    unitsOfMeaning: Array<{language: string, content: string}> // list of language+content pairs
    primaryUnitsOfMeaning: Array<{language: string, content: string}> // list of language+content pairs
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