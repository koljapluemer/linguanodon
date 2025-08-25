import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import { generateAddPronunciation, canGenerateAddPronunciation } from '../task-generator/generateAddPronunciation';
import type { NoteData } from '@/entities/notes/NoteData';

export async function getRandomAddPronunciationTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  _noteRepo: NoteRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Try to get a vocab item that needs pronunciation directly
    const vocabWithMissingPronunciation = await vocabRepo.getRandomVocabWithMissingPronunciation();
    
    if (vocabWithMissingPronunciation && languageCodes.includes(vocabWithMissingPronunciation.language)) {
      const translations = await translationRepo.getTranslationsByIds(vocabWithMissingPronunciation.translations);
      const notes: NoteData[] = [];
      
      if (canGenerateAddPronunciation(vocabWithMissingPronunciation, translations, notes)) {
        return generateAddPronunciation(vocabWithMissingPronunciation);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating add pronunciation task:', error);
    return null;
  }
}