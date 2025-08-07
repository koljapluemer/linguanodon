import type { TaskData } from "@/entities/tasks/TaskData";

export interface Task extends TaskData {
    mayBeConsideredDone: boolean
    isDone: boolean
}