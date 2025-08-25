import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/Task';

export function generateVocabChoiceFromTwoTargetToNative(vocab: VocabData): TaskData {
  const uid = `vocab-choose-from-two-target-to-native-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    taskType: 'vocab-choose-from-two-target-to-native',
    prompt: 'Choose the correct translation',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabChoiceFromTwoTargetToNative(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 0 or 1
  if (vocab.progress.level !== 0 && vocab.progress.level !== 1) return false;
  
  // Must have >0 translations and content
  return translations.length > 0 && !!vocab.content;
}