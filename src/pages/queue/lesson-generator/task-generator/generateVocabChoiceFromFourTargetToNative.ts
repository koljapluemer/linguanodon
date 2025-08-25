import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabChoiceFromFourTargetToNative(vocab: VocabData): Task {
  const uid = `vocab-choose-from-four-target-to-native-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-from-four-target-to-native',
    prompt: 'Choose the correct translation',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabChoiceFromFourTargetToNative(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 1 or 2
  if (vocab.progress.level !== 1 && vocab.progress.level !== 2) return false;
  
  // Must have >0 translations and content
  return translations.length > 0 && !!vocab.content;
}