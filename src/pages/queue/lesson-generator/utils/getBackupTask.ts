import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabFormSentence, canGenerateVocabFormSentence } from '../task-generator/generateVocabFormSentence';
import { generateVocabFormSingleSentence, canGenerateVocabFormSingleSentence } from '../task-generator/generateVocabFormSingleSentence';

export async function getBackupTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract
): Promise<Task | null> {
  try {
    // Get the 1-2 vocab with the lowest due date
    const vocabWithLowestDue = await vocabRepo.getVocabWithLowestDueDate(2);
    
    if (vocabWithLowestDue.length === 0) {
      return null;
    }
    
    if (vocabWithLowestDue.length === 2) {
      // Try to create a two-vocab sentence task
      const vocab1 = vocabWithLowestDue[0];
      const vocab2 = vocabWithLowestDue[1];
      
      const translations1 = await translationRepo.getTranslationsByIds(vocab1.translations);
      const translations2 = await translationRepo.getTranslationsByIds(vocab2.translations);
      
      if (canGenerateVocabFormSentence(vocab1, vocab2, translations1, translations2)) {
        return generateVocabFormSentence(vocab1, vocab2);
      }
    }
    
    // Fall back to single-vocab sentence task with the most due vocab
    const vocab = vocabWithLowestDue[0];
    const translations = await translationRepo.getTranslationsByIds(vocab.translations);
    
    if (canGenerateVocabFormSingleSentence(vocab, translations)) {
      return generateVocabFormSingleSentence(vocab);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating backup task:', error);
    return null;
  }
}