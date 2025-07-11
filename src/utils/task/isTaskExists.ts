import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'

/**
 * Checks if a task already exists by language and content
 */
export async function isTaskExists(
  repository: TaskRepository,
  language: string, 
  content: string
): Promise<boolean> {
  const task = await repository.findTask(language, content)
  return !!task
} 