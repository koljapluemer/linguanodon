import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabRevealTargetToNative, canGenerateVocabRevealTargetToNative } from '../task-generator/generateVocabRevealTargetToNative';
import { generateVocabRevealNativeToTarget, canGenerateVocabRevealNativeToTarget } from '../task-generator/generateVocabRevealNativeToTarget';
import { getRandomDueVocabFromRandomValidImmersionResource } from './getRandomDueVocabFromRandomValidImmersionResource';

async function tryGenerateFromVocab(vocab: VocabData, translationRepo: TranslationRepoContract) {
  const translations = await translationRepo.getTranslationsByIds(vocab.translations);
  
  const canGenerateTargetToNative = canGenerateVocabRevealTargetToNative(vocab, translations);
  const canGenerateNativeToTarget = canGenerateVocabRevealNativeToTarget(vocab, translations);
  
  if (canGenerateTargetToNative || canGenerateNativeToTarget) {
    // Randomly pick between the two if both are available
    if (canGenerateTargetToNative && canGenerateNativeToTarget) {
      return Math.random() < 0.5
        ? generateVocabRevealTargetToNative(vocab)
        : generateVocabRevealNativeToTarget(vocab);
    } else if (canGenerateTargetToNative) {
      return generateVocabRevealTargetToNative(vocab);
    } else {
      return generateVocabRevealNativeToTarget(vocab);
    }
  }
  return null;
}

export async function getRandomVocabRevealTask(
  vocabRepo: VocabRepoContract,
  resourceRepo: ResourceRepoContract,
  translationRepo: TranslationRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // 25% chance to try immersion resource first
    if (Math.random() < 0.25) {
      const immersionVocab = await getRandomDueVocabFromRandomValidImmersionResource(
        resourceRepo, vocabRepo, languageCodes
      );
      if (immersionVocab) {
        const task = await tryGenerateFromVocab(immersionVocab, translationRepo);
        if (task) return task;
      }
    }

    // Fallback to usual flow
    const vocabItems = await vocabRepo.getDueVocabInLanguages(languageCodes);
    
    if (vocabItems.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...vocabItems].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const task = await tryGenerateFromVocab(vocab, translationRepo);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab reveal task:', error);
    return null;
  }
}