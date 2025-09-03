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

export function generateVocabChoiceFromTwoTargetToNative(vocab: VocabData): Task {
  const uid = `vocab-choose-from-two-target-to-native-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-from-two-target-to-native',
    prompt: 'Choose the correct option',
    associatedVocab: [vocab.uid]
  };
}

export function generateVocabChoiceFromTwoNativeToTarget(vocab: VocabData): Task {
  const uid = `vocab-choose-from-two-native-to-target-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-from-two-native-to-target',
    prompt: 'Choose the correct option',
    associatedVocab: [vocab.uid]
  };
}

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