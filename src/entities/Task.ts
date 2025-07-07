import type { TaskData } from "@/entities/TaskData";

export interface Task extends TaskData {
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