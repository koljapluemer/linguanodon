import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';
import { generateClozeReveal } from '@/pages/practice/tasks/task-cloze-reveal/generateClozeReveal';
import { getRandomDueVocabFromRandomValidImmersionResource } from './getRandomDueVocabFromRandomValidImmersionResource';

async function tryGenerateFromVocab(vocab: VocabData) {
  // Filter to only sentence vocab (cloze tasks are now sentence-only)
  if (vocab.length !== 'sentence') {
    return null;
  }

  return generateClozeReveal(vocab);
}

export async function getRandomClozeRevealTask(
  vocabRepo: VocabRepoContract,
  resourceRepo: ResourceRepoContract,
  _translationRepo: TranslationRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    // 25% chance to try immersion resource first
    if (Math.random() < 0.25) {
      const immersionVocab = await getRandomDueVocabFromRandomValidImmersionResource(
        resourceRepo, vocabRepo, languageCodes, vocabBlockList
      );
      if (immersionVocab) {
        const task = await tryGenerateFromVocab(immersionVocab);
        if (task) return task;
      }
    }

    // Get due sentence vocab with level <= 6 directly from DB
    const sentenceVocab = await vocabRepo.getDueSentenceVocabWithMaxLevel(languageCodes, 6, vocabBlockList);
    
    if (sentenceVocab.length === 0) {
      // Fallback to unseen sentence vocab (level -1, so no level filtering needed)
      const unseenSentenceVocab = await vocabRepo.getRandomUnseenSentenceVocab(20, languageCodes, vocabBlockList);
      if (unseenSentenceVocab.length === 0) return null;
      
      for (const vocab of unseenSentenceVocab) {
        const task = await tryGenerateFromVocab(vocab);
        if (task) return task;
      }
      return null;
    }
    
    // Shuffle and try to find a valid vocab item from due sentence vocab
    const shuffled = [...sentenceVocab].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const task = await tryGenerateFromVocab(vocab);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating cloze reveal task:', error);
    return null;
  }
}