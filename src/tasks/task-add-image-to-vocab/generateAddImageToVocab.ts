import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateAddImageToVocab(vocab: VocabData): Task {
  const uid = `add-image-to-vocab-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'add-image-to-vocab',
    prompt: 'Add a visual mnemonic',
    associatedVocab: [vocab.uid]
  };
}