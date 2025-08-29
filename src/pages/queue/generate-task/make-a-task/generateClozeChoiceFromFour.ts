import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateClozeChoiceFromFour(vocab: VocabData): Task {
  const uid = `cloze-choose-from-four-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'cloze-choose-from-four',
    prompt: 'Complete the missing word',
    associatedVocab: [vocab.uid]
  };
}

// export function canGenerateClozeChoiceFromFour(vocab: VocabData, translations: TranslationData[]): boolean {
//   // Only for sentence length
//   if (vocab.length !== 'sentence') return false;
  
//   // Don't generate for level > 6
//   if (vocab.progress.level > 6) return false;
  
//   // Must have content and translations
//   return translations.length > 0 && !!vocab.content;
// }