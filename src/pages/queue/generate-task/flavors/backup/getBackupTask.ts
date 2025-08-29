import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabFormSentence } from '../../make-a-task/generateVocabFormSentence';
import { generateVocabFormSingleSentence } from '../../make-a-task/generateVocabFormSingleSentence';

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
      
      return generateVocabFormSentence(vocab1, vocab2);
    }
    
    // Fall back to single-vocab sentence task with the most due vocab
    const vocab = vocabWithLowestDue[0];
    return generateVocabFormSingleSentence(vocab);
    
    return null;
  } catch (error) {
    console.error('Error generating backup task:', error);
    return null;
  }
}