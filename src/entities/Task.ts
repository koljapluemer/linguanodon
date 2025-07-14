export interface Task {
    language: string;
    content: string;
    primaryUnitsOfMeaning: Array<{language: string, content: string}> 
    secondaryUnitsOfMeaning: Array<{language: string, content: string}> 
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