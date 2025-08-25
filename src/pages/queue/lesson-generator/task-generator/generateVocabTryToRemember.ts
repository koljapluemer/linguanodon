import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TaskData } from '@/entities/tasks/Task';

export function generateVocabTryToRemember(vocab: VocabData): TaskData {
  const uid = `vocab-try-to-remember-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    taskType: 'vocab-try-to-remember',
    prompt: 'Try to remember the meaning of this word',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabTryToRemember(vocab: VocabData): boolean {
  return vocab.progress.level === -1;
}