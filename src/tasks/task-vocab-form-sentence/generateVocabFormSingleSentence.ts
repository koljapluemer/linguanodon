import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabFormSingleSentence(vocab: VocabData): Task {
  const uid = `vocab-form-sentence-single-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-form-sentence-single',
    prompt: 'Form a sentence using this word',
    associatedVocab: [vocab.uid]
  };
}