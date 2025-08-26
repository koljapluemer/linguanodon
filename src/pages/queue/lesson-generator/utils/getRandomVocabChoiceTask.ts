import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabChoiceFromTwoTargetToNative, canGenerateVocabChoiceFromTwoTargetToNative } from '../task-generator/generateVocabChoiceFromTwoTargetToNative';
import { generateVocabChoiceFromTwoNativeToTarget, canGenerateVocabChoiceFromTwoNativeToTarget } from '../task-generator/generateVocabChoiceFromTwoNativeToTarget';
import { generateVocabChoiceFromFourTargetToNative, canGenerateVocabChoiceFromFourTargetToNative } from '../task-generator/generateVocabChoiceFromFourTargetToNative';
import { generateVocabChoiceFromFourNativeToTarget, canGenerateVocabChoiceFromFourNativeToTarget } from '../task-generator/generateVocabChoiceFromFourNativeToTarget';
import { getRandomDueVocabFromRandomValidImmersionResource } from './getRandomDueVocabFromRandomValidImmersionResource';

async function tryGenerateFromVocab(vocab: VocabData, translationRepo: TranslationRepoContract) {
  const translations = await translationRepo.getTranslationsByIds(vocab.translations);
  
  // Collect all available generators
  const availableGenerators = [];
  
  if (canGenerateVocabChoiceFromTwoTargetToNative(vocab, translations)) {
    availableGenerators.push(() => generateVocabChoiceFromTwoTargetToNative(vocab));
  }
  if (canGenerateVocabChoiceFromTwoNativeToTarget(vocab, translations)) {
    availableGenerators.push(() => generateVocabChoiceFromTwoNativeToTarget(vocab));
  }
  if (canGenerateVocabChoiceFromFourTargetToNative(vocab, translations)) {
    availableGenerators.push(() => generateVocabChoiceFromFourTargetToNative(vocab));
  }
  if (canGenerateVocabChoiceFromFourNativeToTarget(vocab, translations)) {
    availableGenerators.push(() => generateVocabChoiceFromFourNativeToTarget(vocab));
  }
  
  if (availableGenerators.length > 0) {
    // Pick random generator
    const randomIndex = Math.floor(Math.random() * availableGenerators.length);
    return availableGenerators[randomIndex]();
  }
  return null;
}

export async function getRandomVocabChoiceTask(
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

    // Fallback to usual flow
    const vocabItems = await vocabRepo.getDueVocabInLanguages(languageCodes, undefined, vocabBlockList);
    
    if (vocabItems.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...vocabItems].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const task = await tryGenerateFromVocab(vocab, translationRepo);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab choice task:', error);
    return null;
  }
}