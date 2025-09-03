import type { VocabData } from '@/entities/vocab/vocab/VocabData';
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