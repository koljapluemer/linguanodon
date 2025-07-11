import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskAttempt } from '@/entities/Task'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])

  /**
   * Adds a task to the store if it doesn't already exist
   */
  function addTask(task: Task) {
    const exists = isTaskExists(task.language, task.content)
    if (!exists) {
      tasks.value.push(task)
    }
  }

  /**
   * Checks if a task already exists by language and content
   */
  function isTaskExists(language: string, content: string): boolean {
    return tasks.value.some(task => 
      task.language === language && task.content === content
    )
  }

  /**
   * Gets all tasks
   */
  function getAllTasks(): Task[] {
    return tasks.value
  }

  /**
   * Gets tasks by language
   */
  function getTasksByLanguage(language: string): Task[] {
    return tasks.value.filter(task => task.language === language)
  }

  /**
   * Gets a task by its content and language (used as ID)
   */
  function getTaskById(language: string, content: string): Task | undefined {
    return tasks.value.find(task => 
      task.language === language && task.content === content
    )
  }

  /**
   * Adds a task attempt to a specific task
   */
  function addTaskAttempt(language: string, content: string, attempt: TaskAttempt) {
    const task = getTaskById(language, content)
    if (task) {
      task.attempts.push(attempt)
    }
  }

  /**
   * Updates the last practiced timestamp for a task
   */
  function updateTaskLastPracticedAt(language: string, content: string) {
    const task = getTaskById(language, content)
    if (task) {
      task.lastPracticedAt = new Date()
    }
  }

  return {
    tasks,
    addTask,
    isTaskExists,
    getAllTasks,
    getTasksByLanguage,
    getTaskById,
    addTaskAttempt,
    updateTaskLastPracticedAt
  }
}, {
  persist: true
})
