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
        const task = await tryGenerateFromVocab(immersionVocab, translationRepo);
        if (task) return task;
      }
    }

    // Get due vocab and filter by reveal task requirements
    const allDueVocab = await vocabRepo.getDueVocabInLanguages(languageCodes, undefined, vocabBlockList);
    
    // Filter vocab based on reveal task level requirements
    const eligibleVocab = allDueVocab.filter(vocab => {
      if (vocab.length === 'sentence') {
        // Sentences need level > 6 for reveal tasks
        return vocab.progress.level > 6;
      } else {
        // Word/unspecified need level >= 3
        return vocab.progress.level >= 3;
      }
    });
    
    if (eligibleVocab.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...eligibleVocab].sort(() => Math.random() - 0.5);
    
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