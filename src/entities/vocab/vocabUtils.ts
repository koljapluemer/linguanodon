import type { VocabData } from './vocab/VocabData';

export function isUnseen(vocab: VocabData): boolean {
  return !vocab.progress || vocab.progress.level === -1;
}

export function isSeen(vocab: VocabData): boolean {
  return vocab.progress && vocab.progress.level >= 0;
}

export function isDue(vocab: VocabData): boolean {
  return isSeen(vocab) && vocab.progress.due && new Date(vocab.progress.due) <= new Date();
}

export function isReady(vocab: VocabData): boolean {
  const vocabIsUnseen = isUnseen(vocab);
  const vocabIsDue = isDue(vocab);
  return vocabIsUnseen || vocabIsDue;
}