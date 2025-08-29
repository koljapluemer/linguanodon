import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateAddTranslation(vocab: VocabData): Task {
  const uid = `add-translation-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'add-translation',
    prompt: 'Add one or more translations',
    associatedVocab: [vocab.uid]
  };
}

// export function canGenerateAddTranslation(vocab: VocabData, translations: TranslationData[]): boolean {
//   if (!vocab.content?.trim()) return false;
//   if (translations.length > 0) return false;
//   return true;
// }


