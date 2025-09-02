import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabChoiceFromFourNativeToTarget(vocab: VocabData): Task {
  const uid = `vocab-choose-from-four-native-to-target-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-from-four-native-to-target',
    prompt: 'Choose the correct option',
    associatedVocab: [vocab.uid]
  };
}