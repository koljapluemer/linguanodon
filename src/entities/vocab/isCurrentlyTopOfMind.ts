import type { VocabData } from './VocabData';

/**
 * Determines if a vocab item is currently "top of mind" - meaning it has reached
 * a sufficient mastery level and is not currently due for review.
 * 
 * Criteria:
 * - Vocab must be at least level 3
 * - Vocab must not be due for review (due date is in the future)
 * 
 * @param vocab The vocab data to check
 * @returns true if the vocab is currently top of mind
 */
export function isCurrentlyTopOfMind(vocab: VocabData): boolean {
  const now = new Date();
  
  // Check if vocab is at least level 3
  const hasRequiredLevel = vocab.progress.level >= 3;
  
  // Check if vocab is not currently due (due date is in the future)
  const isNotDue = vocab.progress.due > now;
  
  return hasRequiredLevel && isNotDue;
}