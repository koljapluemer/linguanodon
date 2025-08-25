import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { TaskData } from '@/entities/tasks/Task';
import { generateVocabRevealTargetToNative, canGenerateVocabRevealTargetToNative } from '../task-generator/generateVocabRevealTargetToNative';
import { generateVocabRevealNativeToTarget, canGenerateVocabRevealNativeToTarget } from '../task-generator/generateVocabRevealNativeToTarget';

export async function getRandomVocabRevealTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  languageCodes: string[]
): Promise<TaskData | null> {
  try {
    // Get due vocab (level 3+ for reveals) which is what we need for this task  
    const vocabItems = await vocabRepo.getDueVocabInLanguages(languageCodes);
    
    if (vocabItems.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...vocabItems].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
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
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab reveal task:', error);
    return null;
  }
}