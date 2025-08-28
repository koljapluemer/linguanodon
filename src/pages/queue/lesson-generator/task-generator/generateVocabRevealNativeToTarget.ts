import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabRevealNativeToTarget(vocab: VocabData): Task {
  const uid = `vocab-reveal-native-to-target-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-reveal-native-to-target',
    prompt: 'What vocab has this translation?',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabRevealNativeToTarget(vocab: VocabData, translations: TranslationData[]): boolean {
  // Different level requirements based on vocab length
  if (vocab.length === 'sentence') {
    // For sentences: only when level > 6 (fallback when cloze can't be generated)
    if (vocab.progress.level <= 6) return false;
  } else {
    // For word/unspecified: level 4 or above
    if (vocab.progress.level < 4) return false;
  }
  
  // Must have >0 translations and content
  return translations.length > 0 && !!vocab.content;
}