import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabChoiceFromTwoNativeToTarget(vocab: VocabData): Task {
  const uid = `vocab-choose-from-two-native-to-target-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-from-two-native-to-target',
    prompt: 'Choose the correct vocab',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabChoiceFromTwoNativeToTarget(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 1 or 2
  if (vocab.progress.level !== 1 && vocab.progress.level !== 2) return false;
  
  // Only allow for 'word' or 'unspecified' length, not 'sentence'
  if (vocab.length === 'sentence') return false;
  
  // Must have >0 translations and content
  return translations.length > 0 && !!vocab.content;
}