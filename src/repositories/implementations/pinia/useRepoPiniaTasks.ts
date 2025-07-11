import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskAttempt } from '@/entities/Task'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'

const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])

  /**
   * Adds a task to the store
   */
  function addTask(task: Task) {
    const exists = tasks.value.some(t => 
      t.language === task.language && t.content === task.content
    )
    if (!exists) {
      tasks.value.push(task)
    }
  }

  /**
   * Deletes a task by language and content
   */
  function deleteTask(language: string, content: string) {
    const index = tasks.value.findIndex(task => 
      task.language === language && task.content === content
    )
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  /**
   * Finds a task by language and content
   */
  function findTask(language: string, content: string): Task | null {
    return tasks.value.find(task => 
      task.language === language && task.content === content
    ) || null
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
   * Adds a task attempt to a specific task
   */
  function addTaskAttempt(language: string, content: string, attempt: TaskAttempt) {
    const task = findTask(language, content)
    if (task) {
      task.attempts.push(attempt)
    }
  }

  /**
   * Updates the last practiced timestamp for a task
   */
  function updateTaskLastPracticedAt(language: string, content: string) {
    const task = findTask(language, content)
    if (task) {
      task.lastPracticedAt = new Date()
    }
  }

  return {
    addTask,
    deleteTask,
    findTask,
    getAllTasks,
    getTasksByLanguage,
    addTaskAttempt,
    updateTaskLastPracticedAt
  }
}, {
  persist: true
})

/**
 * Pinia-backed implementation of TaskRepository
 */
export const piniaTaskRepository: TaskRepository = {
  /**
   * Adds a task to the store
   */
  async addTask(task: Task) {
    useTaskStore().addTask(task)
    return Promise.resolve()
  },
  /**
   * Deletes a task by language and content
   */
  async deleteTask(language: string, content: string) {
    useTaskStore().deleteTask(language, content)
    return Promise.resolve()
  },
  /**
   * Finds a task by language and content
   */
  async findTask(language: string, content: string) {
    return Promise.resolve(useTaskStore().findTask(language, content))
  },
  /**
   * Gets all tasks
   */
  async getAllTasks() {
    return Promise.resolve(useTaskStore().getAllTasks())
  },
  /**
   * Gets tasks by language
   */
  async getTasksByLanguage(language: string) {
    return Promise.resolve(useTaskStore().getTasksByLanguage(language))
  },
  /**
   * Adds a task attempt to a specific task
   */
  async addTaskAttempt(language: string, content: string, attempt: TaskAttempt) {
    useTaskStore().addTaskAttempt(language, content, attempt)
    return Promise.resolve()
  },
  /**
   * Updates the last practiced timestamp for a task
   */
  async updateTaskLastPracticedAt(language: string, content: string) {
    useTaskStore().updateTaskLastPracticedAt(language, content)
    return Promise.resolve()
  }
}
