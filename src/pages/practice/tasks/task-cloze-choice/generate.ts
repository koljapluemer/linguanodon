import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';

export function generateClozeChoiceFromFour(vocab: VocabData): Task {
  const uid = `cloze-choose-from-four-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'cloze-choose-from-four',
    prompt: 'Complete the missing word',
    associatedVocab: [vocab.uid]
  };
}

export function generateClozeChoiceFromTwo(vocab: VocabData): Task {
  const uid = `cloze-choose-from-two-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'cloze-choose-from-two',
    prompt: 'Complete the missing word',
    associatedVocab: [vocab.uid]
  };
}