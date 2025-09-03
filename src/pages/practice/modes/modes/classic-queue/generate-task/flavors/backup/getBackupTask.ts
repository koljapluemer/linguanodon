import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateTaskFormSentenceFromTwoVocab } from '@/pages/practice/tasks/task-vocab-form-sentence/generate';
import { generateFormSentenceTaskFromSingleVocab } from '@/pages/practice/tasks/task-vocab-form-sentence/generate';

export async function getBackupTask(
  vocabRepo: VocabRepoContract,
  _translationRepo: TranslationRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    // Get the 1-2 vocab with the lowest due date
    const vocabWithLowestDue = await vocabRepo.getVocabWithLowestDueDate(2, languageCodes, vocabBlockList);
    
    if (vocabWithLowestDue.length === 0) {
      return null;
    }
    
    if (vocabWithLowestDue.length === 2) {
      // Try to create a two-vocab sentence task
      const vocab1 = vocabWithLowestDue[0];
      const vocab2 = vocabWithLowestDue[1];
      
      return generateTaskFormSentenceFromTwoVocab(vocab1, vocab2);
    }
    
    // Fall back to single-vocab sentence task with the most due vocab
    const vocab = vocabWithLowestDue[0];
    return generateFormSentenceTaskFromSingleVocab(vocab);
    
    return null;
  } catch (error) {
    console.error('Error generating backup task:', error);
    return null;
  }
}