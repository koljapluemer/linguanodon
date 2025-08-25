import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';
import type { NoteData } from '@/entities/notes/NoteData';

export function generateAddPronunciation(vocab: VocabData): Task {
  const uid = `add-pronunciation-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'add-pronunciation',
    prompt: 'Research the pronunciation and add it',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateAddPronunciation(vocab: VocabData, translations: TranslationData[], notes: NoteData[]): boolean {
  // Check priority >= 2
  if ((vocab.priority ?? 0) < 2) return false;
  
  // Check has content
  if (!vocab.content) return false;
  
  // Check has at least one translation
  if (translations.length === 0) return false;
  
  // Check no pronunciation note exists
  const hasPronunciationNote = notes.some(note => note.noteType === 'pronunciation');
  if (hasPronunciationNote) return false;
  
  return true;
}