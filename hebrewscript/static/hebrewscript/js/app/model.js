// @ts-check
/** @typedef {import('../types.js').DistractorCandidate} DistractorCandidate */

// Port of learn-hebrew-script's src/entities/listening-clip/model.ts. Unlike
// Vietnamese tone confusion, Hebrew letter confusion is a single flat
// alphabet swap - any letter can be mistaken for any other letter - so
// there's no family/normalization step, and the `kind` discriminant from the
// source (which distinguished "letter" confusions from a second confusion
// family) is dropped: with only one kind of candidate, it carries no
// information.

export const HEBREW_LETTER_KEYS = /** @type {const} */ ([
  "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י",
  "כ", "ך", "ל", "מ", "ם", "נ", "ן", "ס", "ע", "פ",
  "ף", "צ", "ץ", "ק", "ר", "ש", "ת",
]);

/** @type {Set<string>} */
const hebrewLetterSet = new Set(HEBREW_LETTER_KEYS);

/** @param {string} character */
const isHebrewLetter = (character) => hebrewLetterSet.has(character);

/**
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

/**
 * @param {string} transcript
 * @param {boolean} [stopAfterFirst]
 * @returns {DistractorCandidate[]}
 */
const listCandidatesInternal = (transcript, stopAfterFirst = false) => {
  const characters = [...transcript];
  /** @type {DistractorCandidate[]} */
  const candidates = [];

  for (let changedIndex = 0; changedIndex < characters.length; changedIndex += 1) {
    const character = characters[changedIndex];
    if (!isHebrewLetter(character)) continue;

    for (const alternative of HEBREW_LETTER_KEYS) {
      if (alternative === character) continue;

      const mutated = [...characters];
      mutated[changedIndex] = alternative;
      const label = mutated.join("");
      if (label === transcript) continue;

      candidates.push({
        label,
        changedIndex,
        correctCharacter: character,
        distractorCharacter: alternative,
        correctLetter: character,
        distractorLetter: alternative,
      });

      if (stopAfterFirst) return candidates;
    }
  }

  return candidates;
};

/** @param {string} transcript */
export const canGenerateDistractor = (transcript) => listCandidatesInternal(transcript, true).length > 0;

/**
 * @param {string} transcript
 * @returns {DistractorCandidate[]}
 */
export const listDistractorCandidates = (transcript) => shuffle(listCandidatesInternal(transcript));
