import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabChoiceFromTwoTargetToNative, canGenerateVocabChoiceFromTwoTargetToNative } from '../task-generator/generateVocabChoiceFromTwoTargetToNative';
import { generateVocabChoiceFromTwoNativeToTarget, canGenerateVocabChoiceFromTwoNativeToTarget } from '../task-generator/generateVocabChoiceFromTwoNativeToTarget';
import { generateVocabChoiceFromFourTargetToNative, canGenerateVocabChoiceFromFourTargetToNative } from '../task-generator/generateVocabChoiceFromFourTargetToNative';
import { generateVocabChoiceFromFourNativeToTarget, canGenerateVocabChoiceFromFourNativeToTarget } from '../task-generator/generateVocabChoiceFromFourNativeToTarget';

export async function getRandomVocabChoiceTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Get due vocab for choice tasks (levels 0-2)
    const vocabItems = await vocabRepo.getDueVocabInLanguages(languageCodes);
    
    if (vocabItems.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...vocabItems].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
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
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab choice task:', error);
    return null;
  }
}