import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateAddTranslation } from '@/pages/practice/tasks/task-vocab-add-translation/generateAddTranslation';

export async function getRandomAddTranslationTask(
  vocabRepo: VocabRepoContract,
  _translationRepo: TranslationRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    const vocab = await vocabRepo.getRandomVocabWithNoTranslationsInLanguages(languageCodes, vocabBlockList);
    if (!vocab) return null;
    return generateAddTranslation(vocab);
  } catch (error) {
    console.error('Error generating add translation task:', error);
    return null;
  }
}


