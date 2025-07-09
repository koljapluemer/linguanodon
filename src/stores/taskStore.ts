import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/entities/Task'

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

  return {
    tasks,
    addTask,
    isTaskExists,
    getAllTasks,
    getTasksByLanguage
  }
}, {
  persist: true
})
