import type { VocabData } from '@/entities/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';

export function generateAddTranslation(vocab: VocabData): Task {
  const uid = `add-translation-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'add-translation',
    prompt: 'Add one or more translations',
    associatedVocab: [vocab.uid]
  };
}