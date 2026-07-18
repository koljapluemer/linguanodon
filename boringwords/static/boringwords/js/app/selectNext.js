// @ts-check
// Pure selection function: given the full word list for a language and the
// localStorage-backed FSRS card map, picks which word to show next:
// 1) any due card -> uniform random among due
// 2) else any never-reviewed word -> uniform random among unseen
// 3) else the single word whose card is soonest due

import { pickRandom } from "./random.js";

/**
 * @param {import('../types.js').Word[]} words
 * @param {(wordId: number) => import('../types.js').FsrsCard | null} getCard
 * @param {Date} [now]
 * @returns {import('../types.js').Word | null}
 */
export function selectNextWord(words, getCard, now = new Date()) {
  if (words.length === 0) return null;

  /** @type {import('../types.js').Word[]} */
  const due = [];
  /** @type {import('../types.js').Word[]} */
  const unseen = [];
  /** @type {{word: import('../types.js').Word, card: import('../types.js').FsrsCard} | null} */
  let leastOverdue = null;

  for (const word of words) {
    const card = getCard(word.id);
    if (!card) {
      unseen.push(word);
      continue;
    }
    if (card.due <= now) {
      due.push(word);
      continue;
    }
    if (!leastOverdue || card.due < leastOverdue.card.due) {
      leastOverdue = { word, card };
    }
  }

  if (due.length > 0) return pickRandom(due) ?? null;
  if (unseen.length > 0) return pickRandom(unseen) ?? null;
  return leastOverdue ? leastOverdue.word : null;
}
