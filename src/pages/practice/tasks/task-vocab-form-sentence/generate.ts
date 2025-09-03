import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';

export function generateTaskFormSentenceFromTwoVocab(vocab1: VocabData, vocab2: VocabData): Task {
  const uid = `vocab-form-sentence-${vocab1.uid}-${vocab2.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab1.language,
    taskType: 'vocab-form-sentence',
    prompt: 'Form a sentence using both of these words',
    associatedVocab: [vocab1.uid, vocab2.uid]
  };
}

export function generateFormSentenceTaskFromSingleVocab(vocab: VocabData): Task {
  const uid = `vocab-form-sentence-single-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-form-sentence-single',
    prompt: 'Form a sentence using this word',
    associatedVocab: [vocab.uid]
  };
}