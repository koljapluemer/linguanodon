import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';

export function generateClozeReveal(vocab: VocabData): Task {
  const uid = `cloze-reveal-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'cloze-reveal',
    prompt: 'Think of the missing word, then reveal',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateClozeReveal(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 2 or higher
  if (vocab.progress.level < 2) return false;
  
  // Must be multi-word-expression or single-sentence
  if (vocab.length !== 'multi-word-expression' && vocab.length !== 'single-sentence') return false;
  
  // Must have content and translations
  return translations.length > 0 && !!vocab.content;
}