import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateTaskFormSentenceFromTwoVocab } from '@/pages/practice/tasks/task-vocab-form-sentence/generate';
import { randomFromArray, pickRandom } from '@/shared/utils/arrayUtils';

export async function getRandomVocabFormSentenceTask({
  vocabRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo) return null;
  try {
    // Randomly select a single language to focus on
    const selectedLanguage = randomFromArray(languageCodes);
    if (!selectedLanguage) return null;
    
    // Get due vocab for the selected language only
    const vocabItems = await vocabRepo.getDueVocabInLanguage(selectedLanguage);
    
    if (vocabItems.length < 2) return null;
    
    // Randomly select pairs and try to find a valid combination
    const shuffledVocab = pickRandom(vocabItems, Math.min(20, vocabItems.length));
    
    for (let i = 0; i < shuffledVocab.length; i++) {
      for (let j = i + 1; j < shuffledVocab.length; j++) {
        const vocab1 = shuffledVocab[i];
        const vocab2 = shuffledVocab[j];
        
        return generateTaskFormSentenceFromTwoVocab(vocab1, vocab2);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab form sentence task:', error);
    return null;
  }
}