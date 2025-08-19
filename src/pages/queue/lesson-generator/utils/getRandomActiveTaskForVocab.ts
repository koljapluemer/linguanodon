import type { TaskData } from '@/entities/tasks/TaskData';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { randomFromArray } from '@/shared/arrayUtils';

export async function getRandomActiveTaskForVocab(
  taskRepo: TaskRepoContract,
  vocabUid: string
): Promise<TaskData | null> {
  try {
    const vocabTasks = await taskRepo.getTasksByVocabId(vocabUid);
    const activeTasks = vocabTasks.filter(task => task.isActive);
    
    if (activeTasks.length > 0) {
      return randomFromArray(activeTasks) || null;
    }
  } catch (error) {
    console.warn('Error loading tasks for vocab:', vocabUid, error);
  }
  
  return null;
}