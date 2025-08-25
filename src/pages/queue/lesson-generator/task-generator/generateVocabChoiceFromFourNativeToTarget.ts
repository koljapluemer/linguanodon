import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabChoiceFromFourNativeToTarget(vocab: VocabData): Task {
  const uid = `vocab-choose-from-four-native-to-target-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-from-four-native-to-target',
    prompt: 'Choose the correct vocab',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabChoiceFromFourNativeToTarget(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 2 or 3
  if (vocab.progress.level !== 2 && vocab.progress.level !== 3) return false;
  
  // Must have >0 translations and content
  return translations.length > 0 && !!vocab.content;
}