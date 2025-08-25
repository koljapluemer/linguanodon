import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateClozeChoiceFromTwo, canGenerateClozeChoiceFromTwo } from '../task-generator/generateClozeChoiceFromTwo';
import { generateClozeChoiceFromFour, canGenerateClozeChoiceFromFour } from '../task-generator/generateClozeChoiceFromFour';

export async function getRandomClozeChoiceTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Get due vocab for cloze choice tasks (level 1 only)
    const vocabItems = await vocabRepo.getDueVocabInLanguages(languageCodes);
    
    if (vocabItems.length === 0) return null;
    
    // Filter to only multi-word-expression or single-sentence vocab
    const clozeEligible = vocabItems.filter(vocab => 
      vocab.length === 'multi-word-expression' || vocab.length === 'single-sentence'
    );
    
    if (clozeEligible.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...clozeEligible].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const translations = await translationRepo.getTranslationsByIds(vocab.translations);
      
      // Collect all available generators
      const availableGenerators = [];
      
      if (canGenerateClozeChoiceFromTwo(vocab, translations)) {
        availableGenerators.push(() => generateClozeChoiceFromTwo(vocab));
      }
      if (canGenerateClozeChoiceFromFour(vocab, translations)) {
        availableGenerators.push(() => generateClozeChoiceFromFour(vocab));
      }
      
      if (availableGenerators.length > 0) {
        // Pick random generator
        const randomIndex = Math.floor(Math.random() * availableGenerators.length);
        return availableGenerators[randomIndex]();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating cloze choice task:', error);
    return null;
  }
}