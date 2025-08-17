import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { randomBetween, pickRandom, randomFromArray } from '@/shared/arrayUtils';

// Configuration constants
const MIN_VOCAB_COUNT = 5;
const MAX_VOCAB_COUNT = 20;

export async function makeLessonAroundDueVocab(
  vocabRepo: VocabAndTranslationRepoContract,
  taskRepo: TaskRepoContract,
  languages: string[]
): Promise<TaskData[]> {
  
  const tasks: TaskData[] = [];
  
  try {
    // Get due vocab that was seen before from all active languages
    const dueVocab = await vocabRepo.getDueVocabInLanguages(languages);
    
    if (dueVocab.length === 0) {
      console.warn('No due vocab available for languages:', languages);
      return [];
    }
    
    // Randomly decide how many vocab to include
    const targetVocabCount = randomBetween(MIN_VOCAB_COUNT, MAX_VOCAB_COUNT);
    const actualVocabCount = Math.min(targetVocabCount, dueVocab.length);
    
    // Pick random subset of due vocab
    const selectedVocab = pickRandom(dueVocab, actualVocabCount);
    
    // For each vocab, randomly pick an active task
    for (const vocab of selectedVocab) {
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
        console.warn('Error loading tasks for vocab:', vocab.uid, error);
      }
    }
    
    return tasks;
    
  } catch (error) {
    console.warn('Error in makeLessonAroundDueVocab:', error);
    return [];
  }
}