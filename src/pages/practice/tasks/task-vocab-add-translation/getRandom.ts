import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/entities/tasks/Task';
import { generateAddTranslation } from '@/pages/practice/tasks/task-vocab-add-translation/generate';

export async function getRandomAddTranslationTask({
  vocabRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo) return null;
  
  try {
    const vocab = await vocabRepo.getRandomVocabWithNoTranslationsInLanguages(languageCodes);
    if (!vocab) return null;
    return generateAddTranslation(vocab);
  } catch (error) {
    console.error('Error generating add translation task:', error);
    return null;
  }
}


