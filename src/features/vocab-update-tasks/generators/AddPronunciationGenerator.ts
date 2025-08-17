import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { NoteData } from '@/entities/notes/NoteData';
import { VocabTaskGeneratorBase } from './VocabTaskGeneratorBase';

export class AddPronunciationGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData, translations: TranslationData[], notes: NoteData[]): boolean {
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

  generate(vocab: VocabData): TaskData {
    const uid = `add-pronunciation-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'add-pronunciation',
      'Research the pronunciation and add it',
      'medium',
      false, // don't evaluate difficulty
      false, // don't decide whether to do again
      true   // is one time
    );
  }
}