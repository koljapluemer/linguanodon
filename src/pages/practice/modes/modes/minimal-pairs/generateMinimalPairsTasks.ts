import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { Task } from '@/pages/practice/Task';
import { generateVocabChooseFromSound } from '@/pages/practice/tasks/task-vocab-choose-from-sound/generate';

export async function generateMinimalPairsTask(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  blockList?: string[]
): Promise<Task | null> {
  try {
    // Get a random vocab that meets minimal pairs criteria
    const vocab = await vocabRepo.getRandomDueOrUnseenVocabForMinimalPairs(languageCodes, blockList);
    
    if (!vocab) {
      return null;
    }
    
    // Generate the vocab-choose-from-sound task 
    return generateVocabChooseFromSound(vocab);
    
  } catch (error) {
    console.error('Error generating Minimal Pairs task:', error);
    return null;
  }
}