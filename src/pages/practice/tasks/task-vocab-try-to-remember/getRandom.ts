import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateVocabTryToRemember } from '@/pages/practice/tasks/task-vocab-try-to-remember/generate';

export async function getRandomVocabTryToRememberTask({
  vocabRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo) return null;
  
  try {
    // Get unseen vocab that has both content and translations (excluding sentences for try-to-remember tasks)
    const allUnseenVocab = await vocabRepo.getRandomUnseenVocabWithContentAndTranslations(languageCodes, 10);
    const vocabItems = allUnseenVocab.filter(vocab => vocab.length !== 'sentence');
    
    if (vocabItems.length === 0) return null;
    
    // Return the first valid vocab item
    return generateVocabTryToRemember(vocabItems[0]);
  } catch (error) {
    console.error('Error generating vocab try to remember task:', error);
    return null;
  }
}