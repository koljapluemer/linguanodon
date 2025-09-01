import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabChoiceFromTwoTargetToNative } from '@/tasks/task-vocab-single-choice/generateVocabChoiceFromTwoTargetToNative';
import { generateVocabChoiceFromTwoNativeToTarget } from '@/tasks/task-vocab-single-choice/generateVocabChoiceFromTwoNativeToTarget';
import { generateVocabChoiceFromFourTargetToNative } from '@/tasks/task-vocab-single-choice/generateVocabChoiceFromFourTargetToNative';
import { generateVocabChoiceFromFourNativeToTarget } from '@/tasks/task-vocab-single-choice/generateVocabChoiceFromFourNativeToTarget';
import { getRandomDueVocabFromRandomValidImmersionResource } from './getRandomDueVocabFromRandomValidImmersionResource';

async function tryGenerateFromVocab(vocab: VocabData) {
  // Randomly pick between the four generators
  const availableGenerators = [
    () => generateVocabChoiceFromTwoTargetToNative(vocab),
    () => generateVocabChoiceFromTwoNativeToTarget(vocab),
    () => generateVocabChoiceFromFourTargetToNative(vocab),
    () => generateVocabChoiceFromFourNativeToTarget(vocab)
  ];
  
  const randomIndex = Math.floor(Math.random() * availableGenerators.length);
  return availableGenerators[randomIndex]();
}

export async function getRandomVocabChoiceTask(
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

    // Get due vocab (excluding sentences for choice tasks)
    const allDueVocab = await vocabRepo.getDueVocabInLanguages(languageCodes, undefined, vocabBlockList);
    const eligibleVocab = allDueVocab.filter(vocab => vocab.length !== 'sentence');
    
    if (eligibleVocab.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...eligibleVocab].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const task = await tryGenerateFromVocab(vocab);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab choice task:', error);
    return null;
  }
}