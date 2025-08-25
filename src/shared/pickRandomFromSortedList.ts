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