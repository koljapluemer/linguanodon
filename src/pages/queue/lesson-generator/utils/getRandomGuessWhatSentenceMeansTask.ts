import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateGuessWhatSentenceMeans, canGenerateGuessWhatSentenceMeans } from '../task-generator/generateGuessWhatSentenceMeans';

export async function getRandomGuessWhatSentenceMeansTask(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    // Get unseen sentence vocab
    const vocabItems = await vocabRepo.getRandomUnseenSentenceVocab(10, languageCodes, vocabBlockList);
    
    if (vocabItems.length === 0) return null;
    
    // Find first valid vocab item
    for (const vocab of vocabItems) {
      if (canGenerateGuessWhatSentenceMeans(vocab)) {
        return generateGuessWhatSentenceMeans(vocab);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating guess what sentence means task:', error);
    return null;
  }
}