/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Picks random items from array without duplicates
 */
export function pickRandom<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Weighted random selection from array of items with weights
 */
export function weightedRandom<T>(items: Array<{item: T, weight: number}>): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.item;
    }
  }
  
  return items[items.length - 1].item;
}

/**
 * Removes duplicates from array using optional key function
 */
export function removeDuplicates<T>(array: T[], keyFn?: (item: T) => string | number): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Generates random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a single random item from an array
 */
export function randomFromArray<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Weighted random selection from separate arrays of items and weights
 * All weights must be above 1. Weight 3 is picked 3x more than weight 1, half as much as weight 6.
 */
export function pickWeightedRandom<T>(items: T[], weights: number[]): T | null {
  if (items.length === 0 || weights.length === 0) return null;
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must be same size');
  }
  if (weights.some(w => w < 1)) {
    throw new Error('All weights must be above 1');
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

/**
 * Picks random items from a sorted list with exponential weighting
 * First item is twice as likely as second, second twice as likely as third, etc.
 */
export function pickRandomFromSortedList<T>(items: T[]): T | null {
  if (items.length === 0) {
    return null;
  }
  
  if (items.length === 1) {
    return items[0];
  }
  
  // Calculate total weight where first item has weight 2^(n-1), second 2^(n-2), etc.
  // This makes first item twice as likely as second, second twice as likely as third, etc.
  let totalWeight = 0;
  for (let i = 0; i < items.length; i++) {
    totalWeight += Math.pow(2, items.length - 1 - i);
  }
  
  // Pick random number between 0 and totalWeight
  const randomValue = Math.random() * totalWeight;
  
  // Find which item this random value corresponds to
  let currentWeight = 0;
  for (let i = 0; i < items.length; i++) {
    const itemWeight = Math.pow(2, items.length - 1 - i);
    currentWeight += itemWeight;
    if (randomValue <= currentWeight) {
      return items[i];
    }
  }
  
  // Fallback (should never reach here)
  return items[0];
}