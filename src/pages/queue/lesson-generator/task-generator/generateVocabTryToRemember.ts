import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabTryToRemember(vocab: VocabData): Task {
  const uid = `vocab-try-to-remember-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-try-to-remember',
    prompt: 'Try to remember the meaning of this word',
    associatedVocab: [vocab.uid]
  };
}

export function canGenerateVocabTryToRemember(vocab: VocabData): boolean {
  // Must be unseen vocab
  if (vocab.progress.level !== -1) {
    return false;
  }
  
  // Only allow for unspecified and word length (disable for sentence)
  if (vocab.length === 'sentence') {
    return false;
  }
  
  return true;
}