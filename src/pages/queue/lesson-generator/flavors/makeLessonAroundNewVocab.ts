import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { randomBetween, pickRandom, randomFromArray } from '@/shared/arrayUtils';

// Configuration constants
const MIN_DUE_VOCAB_COUNT = 5;
const MAX_DUE_VOCAB_COUNT = 17;
const MIN_NEW_VOCAB_COUNT = 3;
const MAX_NEW_VOCAB_COUNT = 5;

export async function makeLessonAroundNewVocab(
  vocabRepo: VocabAndTranslationRepoContract,
  taskRepo: TaskRepoContract,
  languages: string[]
): Promise<TaskData[]> {
  
  const tasks: TaskData[] = [];
  
  try {
    // Get due vocab (reduced amount compared to due-only lesson)
    const dueVocab = await vocabRepo.getDueVocabInLanguages(languages);
    const dueVocabCount = randomBetween(MIN_DUE_VOCAB_COUNT, MAX_DUE_VOCAB_COUNT);
    const selectedDueVocab = pickRandom(dueVocab, Math.min(dueVocabCount, dueVocab.length));
    
    // Add tasks for due vocab
    for (const vocab of selectedDueVocab) {
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
    
    // Get new (unseen) vocab
    const newVocabCount = randomBetween(MIN_NEW_VOCAB_COUNT, MAX_NEW_VOCAB_COUNT);
    const newVocab = await vocabRepo.getRandomUnseenVocabInLanguages(languages, newVocabCount);
    
    // Add tasks for new vocab
    for (const vocab of newVocab) {
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
        console.warn('Error loading tasks for new vocab:', vocab.uid, error);
      }
    }
    
    if (tasks.length === 0) {
      console.warn('No tasks generated for new vocab lesson in languages:', languages);
    }
    
    return tasks;
    
  } catch (error) {
    console.warn('Error in makeLessonAroundNewVocab:', error);
    return [];
  }
}