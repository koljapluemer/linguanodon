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

export function canGenerateGuessWhatSentenceMeans(vocab: VocabData): boolean {
  // Must be unseen vocab
  if (vocab.progress.level !== -1) {
    return false;
  }
  
  // Must be sentence type
  if (vocab.length !== 'sentence') {
    return false;
  }
  
  // Must have content and at least one translation
  if (!vocab.content || !vocab.translations || vocab.translations.length === 0) {
    return false;
  }
  
  return true;
}