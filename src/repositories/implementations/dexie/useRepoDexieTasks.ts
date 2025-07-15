import { db } from './dexieDB'
import type { Task, TaskAttempt } from '@/entities/Task'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'

/**
 * Dexie implementation of TaskRepository
 */
export function useRepoDexieTasks(): TaskRepository {
  return {
    /**
     * Adds a new task to the database
     */
    async addTask(task: Task): Promise<void> {
      try {
        await db.tasks.add(task)
      } catch (error) {
        if (error instanceof Error && error.name === 'ConstraintError') {
          throw new Error(`Task with language ${task.language} and content ${task.content} already exists`)
        }
        throw error
      }
    },

    /**
     * Deletes a task by language and content
     */
    async deleteTask(language: string, content: string): Promise<void> {
      await db.tasks.delete([language, content])
    },

    /**
     * Finds a task by language and content
     */
    async findTask(language: string, content: string): Promise<Task | null> {
      return await db.tasks.get([language, content]) || null
    },

    /**
     * Gets all tasks from the database
     */
    async getAllTasks(): Promise<Task[]> {
      return await db.tasks.toArray()
    },

    /**
     * Gets all tasks for a specific language
     */
    async getTasksByLanguage(language: string): Promise<Task[]> {
      return await db.tasks.filter(task => task.language === language).toArray()
    },

    /**
     * Adds a task attempt to a specific task
     */
    async addTaskAttempt(language: string, content: string, attempt: TaskAttempt): Promise<void> {
      const task = await db.tasks.get([language, content])
      if (!task) {
        throw new Error(`Task with language ${language} and content ${content} not found`)
      }
      
      task.attempts.push(attempt)
      await db.tasks.put(task)
    },

    /**
     * Updates the last practiced timestamp for a task
     */
    async updateTaskLastPracticedAt(language: string, content: string): Promise<void> {
      const task = await db.tasks.get([language, content])
      if (!task) {
        throw new Error(`Task with language ${language} and content ${content} not found`)
      }
      
      task.lastPracticedAt = new Date()
      await db.tasks.put(task)
    },

    /**
     * Finds a task by its uid.
     */
    async getTaskByUid(uid: string): Promise<Task | null> {
      const allTasks = await db.tasks.toArray();
      console.log('DexieRepo: getTaskByUid called with:', uid);
      console.log('DexieRepo: All available uids:', allTasks.map(t => t.uid));
      return await db.tasks.where('uid').equals(uid).first() || null;
    }
  }
}
