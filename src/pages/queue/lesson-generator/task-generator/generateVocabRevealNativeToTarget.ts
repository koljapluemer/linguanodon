import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/Task';

export function generateVocabRevealNativeToTarget(vocab: VocabData): TaskData {
  const uid = `vocab-reveal-native-to-target-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    taskType: 'vocab-reveal-native-to-target',
    prompt: 'What vocab has this translation?',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabRevealNativeToTarget(vocab: VocabData, translations: TranslationData[]): boolean {
  // Level 4 or above
  if (vocab.progress.level < 4) return false;
  
  // Must have >0 translations and content
  return translations.length > 0 && !!vocab.content;
}