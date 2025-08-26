import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';
import { generateClozeReveal, canGenerateClozeReveal } from '../task-generator/generateClozeReveal';
import { getRandomDueVocabFromRandomValidImmersionResource } from './getRandomDueVocabFromRandomValidImmersionResource';

async function tryGenerateFromVocab(vocab: VocabData, translationRepo: TranslationRepoContract) {
  // Filter to only word or sentence vocab
  if (vocab.length !== 'word' && vocab.length !== 'sentence') {
    return null;
  }

  const translations = await translationRepo.getTranslationsByIds(vocab.translations);
  
  if (canGenerateClozeReveal(vocab, translations)) {
    return generateClozeReveal(vocab);
  }
  return null;
}

export async function getRandomClozeRevealTask(
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
    
    // Filter to only word or sentence vocab
    const clozeEligible = vocabItems.filter(vocab => 
      vocab.length === 'word' || vocab.length === 'sentence'
    );
    
    if (clozeEligible.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...clozeEligible].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const task = await tryGenerateFromVocab(vocab, translationRepo);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating cloze reveal task:', error);
    return null;
  }
}