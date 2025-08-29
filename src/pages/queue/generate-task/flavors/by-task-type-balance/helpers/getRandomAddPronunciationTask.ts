import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import { generateAddPronunciation } from '../../../make-a-task/generateAddPronunciation';

export async function getRandomAddPronunciationTask(
  vocabRepo: VocabRepoContract,
  _translationRepo: TranslationRepoContract,
  _noteRepo: NoteRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    // Try to get a vocab item that needs pronunciation directly
    const vocabWithMissingPronunciation = await vocabRepo.getRandomVocabWithMissingPronunciation(languageCodes, vocabBlockList);
    
    if (vocabWithMissingPronunciation) {
      return generateAddPronunciation(vocabWithMissingPronunciation);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating add pronunciation task:', error);
    return null;
  }
}