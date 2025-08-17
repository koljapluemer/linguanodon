import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { randomBetween, randomFromArray } from '@/shared/arrayUtils';

// Configuration constants
const MIN_TASK_COUNT = 5;
const MAX_TASK_COUNT = 20;

export async function makeLessonAroundResourceExtraction(
  vocabRepo: VocabAndTranslationRepoContract,
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract,
  languages: string[]
): Promise<TaskData[]> {
  
  const tasks: TaskData[] = [];
  
  try {
    // Randomly decide number of tasks
    const targetTaskCount = randomBetween(MIN_TASK_COUNT, MAX_TASK_COUNT);
    
    // Find an active resource
    const resource = await resourceRepo.getRandomDueResource();
    
    if (!resource) {
      console.warn('No active resources available');
      // Fall back to due vocab tasks
      return await fillWithDueVocabTasks(vocabRepo, taskRepo, languages, targetTaskCount);
    }
    
    // Add one of the resource's active tasks
    try {
      const resourceTasks = await taskRepo.getTasksByResourceId(resource.uid);
      const activeResourceTasks = resourceTasks.filter(task => task.isActive);
      
      if (activeResourceTasks.length > 0) {
        const randomResourceTask = randomFromArray(activeResourceTasks);
        if (randomResourceTask) {
          tasks.push(randomResourceTask);
        }
      }
    } catch (error) {
      console.warn('Error loading resource tasks:', error);
    }
    
    // Fill up with active tasks of vocab attached to the resource
    for (const vocabUid of resource.vocab) {
      if (tasks.length >= targetTaskCount) break;
      
      try {
        const vocabTasks = await taskRepo.getTasksByVocabId(vocabUid);
        const activeVocabTasks = vocabTasks.filter(task => task.isActive);
        
        if (activeVocabTasks.length > 0) {
          const randomTask = randomFromArray(activeVocabTasks);
          if (randomTask) {
            tasks.push(randomTask);
          }
        }
      } catch (error) {
        console.warn('Error loading tasks for resource vocab:', vocabUid, error);
      }
    }
    
    // If still missing tasks, fill up with due vocab from the whole app
    if (tasks.length < targetTaskCount) {
      const remainingCount = targetTaskCount - tasks.length;
      const additionalTasks = await fillWithDueVocabTasks(vocabRepo, taskRepo, languages, remainingCount);
      tasks.push(...additionalTasks);
    }
    
    return tasks;
    
  } catch (error) {
    console.warn('Error in makeLessonAroundResourceExtraction:', error);
    return [];
  }
}

async function fillWithDueVocabTasks(
  vocabRepo: VocabAndTranslationRepoContract,
  taskRepo: TaskRepoContract,
  languages: string[],
  count: number
): Promise<TaskData[]> {
  
  const tasks: TaskData[] = [];
  
  try {
    const dueVocab = await vocabRepo.getDueVocabInLanguages(languages);
    
    for (const vocab of dueVocab) {
      if (tasks.length >= count) break;
      
      try {
        const vocabTasks = await taskRepo.getTasksByVocabId(vocab.uid);
        const activeTasks = vocabTasks.filter(task => task.isActive);
        
        if (activeTasks.length > 0) {
          const randomTask = randomFromArray(activeTasks);
          if (randomTask) {
            tasks.push(randomTask);
          }
        }
      } catch (error) {
        console.warn('Error loading tasks for due vocab:', vocab.uid, error);
      }
    }
  } catch (error) {
    console.warn('Error loading due vocab for fallback:', error);
  }
  
  return tasks;
}