import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateAddTranslation, canGenerateAddTranslation } from '../task-generator/generateAddTranslation';

export async function getRandomAddTranslationTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    const vocab = await vocabRepo.getRandomVocabWithNoTranslationsInLanguages(languageCodes, vocabBlockList);
    if (!vocab) return null;
    const translations = await translationRepo.getTranslationsByIds(vocab.translations);
    if (canGenerateAddTranslation(vocab, translations)) {
      return generateAddTranslation(vocab);
    }
    return null;
  } catch (error) {
    console.error('Error generating add translation task:', error);
    return null;
  }
}


