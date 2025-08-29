import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

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