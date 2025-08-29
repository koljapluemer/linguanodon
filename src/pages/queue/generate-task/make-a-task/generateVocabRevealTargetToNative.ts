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