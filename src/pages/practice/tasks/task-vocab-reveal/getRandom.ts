import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabRevealNativeToTarget, generateVocabRevealTargetToNative } from '@/pages/practice/tasks/task-vocab-reveal/generate';
import { getRandomDueVocabFromRandomValidImmersionResource } from '../../modes/utils/getRandomDueVocabFromRandomValidImmersionResource';

async function tryGenerateFromVocab(vocab: VocabData) {
  // Randomly pick between the two generators
  return Math.random() < 0.5
    ? generateVocabRevealTargetToNative(vocab)
    : generateVocabRevealNativeToTarget(vocab);
}

export async function getRandomVocabRevealTask({
  vocabRepo,
  resourceRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo || !resourceRepo) return null;
  try {
    // 25% chance to try immersion resource first
    if (Math.random() < 0.25) {
      const immersionVocab = await getRandomDueVocabFromRandomValidImmersionResource(
        resourceRepo, vocabRepo, languageCodes
      );
      if (immersionVocab) {
        const task = await tryGenerateFromVocab(immersionVocab);
        if (task) return task;
      }
    }

    // Get due vocab and filter by reveal task requirements
    const allDueVocab = await vocabRepo.getDueVocabInLanguages(languageCodes);
    
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
      const task = await tryGenerateFromVocab(vocab);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab reveal task:', error);
    return null;
  }
}