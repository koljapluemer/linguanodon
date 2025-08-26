import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { getRandomGeneratedTaskForVocab } from './getRandomGeneratedTaskForVocab';

export async function getTaskBasedOnVocab(
  vocabUid: string,
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  noteRepo: NoteRepoContract
): Promise<Task | null> {
  try {
    // Get the vocab by UID
    const vocab = await vocabRepo.getVocabByUID(vocabUid);
    if (!vocab) {
      console.warn(`Vocab not found for UID: ${vocabUid}`);
      return null;
    }

    // Get related data
    const translations = await translationRepo.getTranslationsByIds(vocab.translations);
    const notes = await noteRepo.getNotesByUIDs(vocab.notes);

    // Generate a task based on this specific vocab
    return await getRandomGeneratedTaskForVocab(vocab, translations, notes);
  } catch (error) {
    console.error(`Error generating task for vocab ${vocabUid}:`, error);
    return null;
  }
}