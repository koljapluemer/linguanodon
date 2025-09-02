import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabChoiceFromFourTargetToNative(vocab: VocabData): Task {
  const uid = `vocab-choose-from-four-target-to-native-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-from-four-target-to-native',
    prompt: 'Choose the correct option',
    associatedVocab: [vocab.uid]
  };
}