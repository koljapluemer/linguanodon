import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateAddPronunciation(vocab: VocabData): Task {
  const uid = `add-pronunciation-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'add-pronunciation',
    prompt: 'Research the pronunciation and add it',
    associatedVocab: [vocab.uid]
  };
}