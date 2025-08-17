import type { VocabData } from './VocabData';

/**
 * Check if vocab has never been seen/encountered by the user
 * @param vocab - The vocab data to check
 * @returns true if vocab is truly unseen (level -1), false if it has been seen/initialized
 */
export function isUnseen(vocab: VocabData): boolean {
  return vocab.progress.level === -1;
}

/**
 * Check if vocab has been seen/encountered by the user (but may not have been practiced)
 * @param vocab - The vocab data to check  
 * @returns true if vocab has been seen (level >= 0), false if it's truly unseen
 */
export function isSeen(vocab: VocabData): boolean {
  return vocab.progress.level >= 0;
}