import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TaskData } from '@/entities/tasks/Task';
import { generateVocabTryToRemember, canGenerateVocabTryToRemember } from '../task-generator/generateVocabTryToRemember';

export async function getRandomVocabTryToRememberTask(
  vocabRepo: VocabRepoContract,
  languageCodes: string[]
): Promise<TaskData | null> {
  try {
    // Get unseen vocab (level -1) which is what we need for this task
    const vocabItems = await vocabRepo.getRandomUnseenVocabInLanguages(languageCodes, 10);
    
    if (vocabItems.length === 0) return null;
    
    // Find first valid vocab item
    for (const vocab of vocabItems) {
      if (canGenerateVocabTryToRemember(vocab)) {
        return generateVocabTryToRemember(vocab);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab try to remember task:', error);
    return null;
  }
}