import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateGuessWhatSentenceMeans(vocab: VocabData): Task {
  const uid = `guess-what-sentence-means-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'guess-what-sentence-means',
    prompt: 'Guess what this sentence means',
    associatedVocab: [vocab.uid]
  };
}