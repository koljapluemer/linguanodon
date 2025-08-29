import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabTryToRemember } from '../../../make-a-task/generateVocabTryToRemember';
import { getRandomNewVocabFromRandomValidImmersionResource } from './getRandomNewVocabFromRandomValidImmersionResource';

export async function getRandomVocabTryToRememberTask(
  vocabRepo: VocabRepoContract,
  resourceRepo: ResourceRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    // 25% chance to try immersion resource first
    if (Math.random() < 0.25) {
      const immersionVocab = await getRandomNewVocabFromRandomValidImmersionResource(
        resourceRepo, vocabRepo, languageCodes, vocabBlockList
      );
      if (immersionVocab) {
        return generateVocabTryToRemember(immersionVocab);
      }
    }

    // Get unseen vocab (excluding sentences for try-to-remember tasks)
    const allUnseenVocab = await vocabRepo.getRandomUnseenVocabInLanguages(languageCodes, 10, undefined, vocabBlockList);
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