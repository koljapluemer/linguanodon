// @ts-check
// Vendored copy of infinitesentences' random.js (port of
// infinite-sentences-frontend's src/dumb/random.ts).

/**
 * @template T
 * @param {ReadonlyArray<T>} items
 * @returns {T | undefined}
 */
export function pickRandom(items) {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * @template T
 * @param {ReadonlyArray<T>} items
 * @returns {T[]}
 */
export function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * @template T
 * @param {ReadonlyArray<T>} items
 * @param {number} count
 * @returns {T[]}
 */
export function takeRandom(items, count) {
  if (count <= 0) return [];
  return shuffleArray(items).slice(0, count);
}
