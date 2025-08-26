import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
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

export function canGenerateClozeChoiceFromFour(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 1 only
  if (vocab.progress.level !== 1) return false;
  
  // Must be word or sentence
  if (vocab.length !== 'word' && vocab.length !== 'sentence') return false;
  
  // Must have content and translations
  return translations.length > 0 && !!vocab.content;
}