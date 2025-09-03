import type { VocabData } from '@/entities/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';

export function generateClozeReveal(vocab: VocabData): Task {
  const uid = `cloze-reveal-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'cloze-reveal',
    prompt: 'Think of the missing word, then reveal',
    associatedVocab: [vocab.uid]
  };
}