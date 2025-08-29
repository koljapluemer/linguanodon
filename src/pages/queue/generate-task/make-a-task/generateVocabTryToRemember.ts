import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabTryToRemember(vocab: VocabData): Task {
  const uid = `vocab-try-to-remember-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-try-to-remember',
    prompt: 'Try to memorize',
    associatedVocab: [vocab.uid]
  };
}