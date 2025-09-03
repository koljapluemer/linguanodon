import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateVocabTryToRemember } from '@/pages/practice/tasks/task-vocab-try-to-remember/generate';
import { getRandomNewVocabFromRandomValidImmersionResource } from '../../modes/utils/getRandomNewVocabFromRandomValidImmersionResource';

export async function getRandomVocabTryToRememberTask({
  vocabRepo,
  resourceRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo || !resourceRepo) return null;
  
  try {
    // 25% chance to try immersion resource first
    if (Math.random() < 0.25) {
      const immersionVocab = await getRandomNewVocabFromRandomValidImmersionResource(
        resourceRepo, vocabRepo, languageCodes
      );
      if (immersionVocab) {
        return generateVocabTryToRemember(immersionVocab);
      }
    }

    // Get unseen vocab (excluding sentences for try-to-remember tasks)
    const allUnseenVocab = await vocabRepo.getRandomUnseenVocabInLanguages(languageCodes, 10);
    const vocabItems = allUnseenVocab.filter(vocab => vocab.length !== 'sentence');
    
    if (vocabItems.length === 0) return null;
    
    // Get first vocab item
    for (const vocab of vocabItems) {
      return generateVocabTryToRemember(vocab);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab try to remember task:', error);
    return null;
  }
}