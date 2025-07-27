import { fsrs } from 'ts-fsrs';
import type { VocabData } from './vocab/VocabData';

/**
 * Calculate mastery level for a vocab item based on ts-fsrs retrievability
 * 
 * Mastery is calculated with weighted components:
 * - Level progression: 50% weight (level -1 and 0 = 0%, level 1 = 25%, level 2 = 50%, level 3 = 75%, level 4+ = 100%)
 * - Retrievability in 1 day: 16.67% weight
 * - Retrievability in 1 week: 16.67% weight  
 * - Retrievability in 1 year: 16.67% weight
 * 
 * @param vocab - The vocab item to calculate mastery for
 * @returns Mastery percentage (0-100)
 */
export function calculateVocabMastery(vocab: VocabData): number {
  const scheduler = fsrs();
  const now = new Date();
  
  // Component 1: Retrievability in 1 day
  const oneDayFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const oneDayRetrievability = scheduler.get_retrievability(vocab.progress, oneDayFuture, false) as number;
  
  // Component 2: Retrievability in 1 week  
  const oneWeekFuture = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneWeekRetrievability = scheduler.get_retrievability(vocab.progress, oneWeekFuture, false) as number;
  
  // Component 3: Retrievability in 1 year
  const oneYearFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const oneYearRetrievability = scheduler.get_retrievability(vocab.progress, oneYearFuture, false) as number;
  
  // Component 4: Level progression (level -1 and 0 = 0%, level 1+ mapped to 25-100%)
  const level = vocab.progress.level;
  let levelComponent: number;
  if (level <= 0) {
    levelComponent = 0;
  } else if (level >= 4) {
    levelComponent = 1;
  } else {
    // Linear scaling: level 1 = 25%, level 2 = 50%, level 3 = 75%
    levelComponent = level / 4;
  }
  
  // Weighted calculation: 50% level, 16.67% each retrievability component
  const retrievabilityWeight = 1/6; // 16.67%
  const levelWeight = 0.5; // 50%
  
  const mastery = (
    (oneDayRetrievability * retrievabilityWeight) +
    (oneWeekRetrievability * retrievabilityWeight) +
    (oneYearRetrievability * retrievabilityWeight) +
    (levelComponent * levelWeight)
  );
  
  return Math.round(mastery * 100);
}