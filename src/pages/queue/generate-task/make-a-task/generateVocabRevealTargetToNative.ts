import type { VocabData } from '@/entities/vocab/vocab/VocabData';
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

// export function canGenerateVocabRevealTargetToNative(vocab: VocabData, translations: TranslationData[]): boolean {
//   // Different level requirements based on vocab length
//   if (vocab.length === 'sentence') {
//     // For sentences: only when level > 6 (fallback when cloze can't be generated)
//     if (vocab.progress.level <= 6) return false;
//   } else {
//     // For word/unspecified: level 3 or above
//     if (vocab.progress.level < 3) return false;
//   }
  
//   // Must have >0 translations and content
//   return translations.length > 0 && !!vocab.content;
// }