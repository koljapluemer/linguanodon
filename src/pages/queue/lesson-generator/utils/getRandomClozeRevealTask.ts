import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateClozeReveal, canGenerateClozeReveal } from '../task-generator/generateClozeReveal';

export async function getRandomClozeRevealTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Get due vocab for cloze reveal tasks (level 2+)
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
      
      if (canGenerateClozeReveal(vocab, translations)) {
        return generateClozeReveal(vocab);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating cloze reveal task:', error);
    return null;
  }
}