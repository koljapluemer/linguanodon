import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabRevealTargetToNative(vocab: VocabData): Task {
  const uid = `vocab-reveal-target-to-native-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-reveal-target-to-native',
    prompt: 'What does this mean?',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabRevealTargetToNative(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 3 or above
  if (vocab.progress.level < 3) return false;
  
  // Must have >0 translations and content
  return translations.length > 0 && !!vocab.content;
}