import type { Task, TaskAttempt } from "@/entities/Task"

export interface TaskRepository {
    addTask(task: Task): Promise<void>
    deleteTask(language: string, content: string): Promise<void>
    findTask(language: string, content: string): Promise<Task | null>
    getAllTasks(): Promise<Task[]>
    getTasksByLanguage(language: string): Promise<Task[]>
    addTaskAttempt(language: string, content: string, attempt: TaskAttempt): Promise<void>
    updateTaskLastPracticedAt(language: string, content: string): Promise<void>
    getTaskByUid(uid: string): Promise<Task | null>
}
