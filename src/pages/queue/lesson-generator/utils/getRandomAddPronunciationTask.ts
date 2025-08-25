import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { TaskData } from '@/entities/tasks/Task';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import { generateAddPronunciation, canGenerateAddPronunciation } from '../task-generator/generateAddPronunciation';

export async function getRandomAddPronunciationTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  noteRepo: NoteRepoContract,
  languageCodes: string[]
): Promise<TaskData | null> {
  try {
    // Try to get a vocab item that needs pronunciation directly
    const vocabWithMissingPronunciation = await vocabRepo.getRandomVocabWithMissingPronunciation();
    
    if (vocabWithMissingPronunciation && languageCodes.includes(vocabWithMissingPronunciation.language)) {
      const translations = await translationRepo.getTranslationsByIds(vocabWithMissingPronunciation.translations);
      const notes = await noteRepo.getNotesByUIDs(vocabWithMissingPronunciation.notes);
      
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