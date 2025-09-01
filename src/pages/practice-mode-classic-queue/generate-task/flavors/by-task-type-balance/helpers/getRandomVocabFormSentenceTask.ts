import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabFormSentence } from '@/tasks/task-vocab-form-sentence/generateVocabFormSentence';
import { randomFromArray, pickRandom } from '@/shared/arrayUtils';

export async function getRandomVocabFormSentenceTask(
  vocabRepo: VocabRepoContract,
  _translationRepo: TranslationRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    // Randomly select a single language to focus on
    const selectedLanguage = randomFromArray(languageCodes);
    if (!selectedLanguage) return null;
    
    // Get due vocab for the selected language only
    const vocabItems = await vocabRepo.getDueVocabInLanguage(selectedLanguage, vocabBlockList);
    
    if (vocabItems.length < 2) return null;
    
    // Randomly select pairs and try to find a valid combination
    const shuffledVocab = pickRandom(vocabItems, Math.min(20, vocabItems.length));
    
    for (let i = 0; i < shuffledVocab.length; i++) {
      for (let j = i + 1; j < shuffledVocab.length; j++) {
        const vocab1 = shuffledVocab[i];
        const vocab2 = shuffledVocab[j];
        
        return generateVocabFormSentence(vocab1, vocab2);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab form sentence task:', error);
    return null;
  }
}