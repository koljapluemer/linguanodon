// @ts-check
/** @typedef {import('../types.js').DistractorCandidate} DistractorCandidate */

// Tone-only port of listen-to-viet's src/entities/listening-clip/model.ts.
// The cross-family/letter-substitution half of the original algorithm
// (ACTIVE_LETTER_KEYS, isSupportedLetterPair, alternativeMap's letter
// section, getConfusionKind) is not ported at all: with only same-family
// (tone) alternatives below, every generated candidate is a tone candidate
// by construction.

export const TONE_KEYS = /** @type {const} */ (["ngang", "huyen", "sac", "hoi", "nga", "nang"]);

const VOWEL_FAMILIES = [
  ["a", "à", "á", "ả", "ã", "ạ"],
  ["ă", "ằ", "ắ", "ẳ", "ẵ", "ặ"],
  ["â", "ầ", "ấ", "ẩ", "ẫ", "ậ"],
  ["e", "è", "é", "ẻ", "ẽ", "ẹ"],
  ["ê", "ề", "ế", "ể", "ễ", "ệ"],
  ["i", "ì", "í", "ỉ", "ĩ", "ị"],
  ["o", "ò", "ó", "ỏ", "õ", "ọ"],
  ["ô", "ồ", "ố", "ổ", "ỗ", "ộ"],
  ["ơ", "ờ", "ớ", "ở", "ỡ", "ợ"],
  ["u", "ù", "ú", "ủ", "ũ", "ụ"],
  ["ư", "ừ", "ứ", "ử", "ữ", "ự"],
  ["y", "ỳ", "ý", "ỷ", "ỹ", "ỵ"],
];

const TRANSCRIPT_CLEANUP_PATTERN = /(^|\s)-N(?=\s|$)/g;
const WORD_SPLIT_PATTERN = /\s+/;
const ALPHABETIC_CHARACTER_PATTERN = /^\p{L}$/u;

const VIETNAMESE_ALPHABET_CHARACTERS = [
  "a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n",
  "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y",
  ...VOWEL_FAMILIES.flatMap((family) => family.slice(1)),
];

/** @param {readonly string[]} characters */
const buildCharacterSet = (characters) => {
  const set = new Set();
  characters.forEach((character) => {
    set.add(character);
    set.add(character.toUpperCase());
  });
  return set;
};

const TONE_MARKED_CHARACTER_SET = buildCharacterSet(VOWEL_FAMILIES.flatMap((family) => family.slice(1)));
const DEFINITELY_VIETNAMESE_CHARACTER_SET = buildCharacterSet([
  "ă", "â", "ê", "ô", "ơ", "ư", "đ",
  ...VOWEL_FAMILIES.flatMap((family) => family.slice(1)),
]);
const VIETNAMESE_ALPHABET_CHARACTER_SET = buildCharacterSet(VIETNAMESE_ALPHABET_CHARACTERS);

/** @type {Map<string, string>} */
const characterToneMap = (() => {
  const map = new Map();
  for (const family of VOWEL_FAMILIES) {
    family.forEach((character, toneIndex) => {
      map.set(character, TONE_KEYS[toneIndex]);
    });
  }
  for (const [character, tone] of [...map.entries()]) {
    map.set(character.toUpperCase(), tone);
  }
  return map;
})();

/** @type {Map<string, string[]>} */
const alternativeMap = (() => {
  /** @type {Map<string, Set<string>>} */
  const map = new Map();

  /** @param {string} source @param {string} candidate */
  const addAlternative = (source, candidate) => {
    if (source === candidate) return;
    const alternatives = map.get(source) ?? new Set();
    alternatives.add(candidate);
    map.set(source, alternatives);
  };

  // Same vowel-family, cross-tone alternatives (e.g. all 6 tones of "a" are
  // mutually confusable). The source's cross-family/letter section is
  // intentionally not ported here.
  for (const family of VOWEL_FAMILIES) {
    for (const source of family) {
      for (const candidate of family) {
        addAlternative(source, candidate);
      }
    }
  }

  // Uppercase mirroring of everything built above.
  for (const [source, candidates] of [...map.entries()]) {
    const upperSource = source.toUpperCase();
    for (const candidate of candidates) {
      addAlternative(upperSource, candidate.toUpperCase());
    }
  }

  return new Map([...map.entries()].map(([source, candidates]) => [source, [...candidates]]));
})();

/** @param {string} character */
const isAlphabeticCharacter = (character) => ALPHABETIC_CHARACTER_PATTERN.test(character);

/** @param {string[]} characters */
const getTokenSpans = (characters) => {
  /** @type {{start: number, end: number}[]} */
  const spans = [];
  /** @type {number | null} */
  let tokenStart = null;

  characters.forEach((character, index) => {
    if (isAlphabeticCharacter(character)) {
      if (tokenStart === null) tokenStart = index;
      return;
    }
    if (tokenStart !== null) {
      spans.push({ start: tokenStart, end: index });
      tokenStart = null;
    }
  });

  if (tokenStart !== null) {
    spans.push({ start: tokenStart, end: characters.length });
  }

  return spans;
};

/** @param {{start: number, end: number}[]} tokenSpans @param {number} index */
const getTokenSpanForIndex = (tokenSpans, index) => {
  for (const span of tokenSpans) {
    if (index >= span.start && index < span.end) return span;
  }
  return null;
};

/** @param {string} token */
const isVietnameseConfirmedToken = (token) =>
  [...token].some((character) => DEFINITELY_VIETNAMESE_CHARACTER_SET.has(character));

/** @param {string} token */
const hasOnlyVietnameseAlphabetCharacters = (token) =>
  [...token].every(
    (character) => !isAlphabeticCharacter(character) || VIETNAMESE_ALPHABET_CHARACTER_SET.has(character)
  );

/** @param {string} token */
const isValidSourceToken = (token) => isVietnameseConfirmedToken(token) && hasOnlyVietnameseAlphabetCharacters(token);

/** @param {string} token */
const getToneMarkedCharacterCount = (token) =>
  [...token].filter((character) => TONE_MARKED_CHARACTER_SET.has(character)).length;

/** @param {string} token */
const isValidMutatedToken = (token) => getToneMarkedCharacterCount(token) <= 1;

/** @param {string} value */
export const normalizeTranscript = (value) =>
  value.replace(TRANSCRIPT_CLEANUP_PATTERN, " ").replace(WORD_SPLIT_PATTERN, " ").trim();

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
 * @returns {DistractorCandidate[]}
 */
const listDistractorCandidatesInternal = (transcript) => {
  const normalizedTranscript = normalizeTranscript(transcript);
  const characters = [...normalizedTranscript];
  const tokenSpans = getTokenSpans(characters);
  /** @type {DistractorCandidate[]} */
  const candidates = [];

  for (let changedIndex = 0; changedIndex < characters.length; changedIndex += 1) {
    const character = characters[changedIndex];
    const sourceTone = characterToneMap.get(character);
    const alternatives = alternativeMap.get(character);

    if (!sourceTone || !alternatives?.length) continue;

    const tokenSpan = getTokenSpanForIndex(tokenSpans, changedIndex);
    if (!tokenSpan) continue;

    const sourceToken = characters.slice(tokenSpan.start, tokenSpan.end).join("");
    if (!isValidSourceToken(sourceToken)) continue;

    for (const alternative of alternatives) {
      const distractorTone = characterToneMap.get(alternative);
      if (!distractorTone) continue;

      const mutated = [...characters];
      mutated[changedIndex] = alternative;
      const label = mutated.join("");
      if (label === normalizedTranscript) continue;

      const mutatedToken = mutated.slice(tokenSpan.start, tokenSpan.end).join("");
      if (!isValidMutatedToken(mutatedToken)) continue;

      candidates.push({
        label,
        changedIndex,
        correctCharacter: character,
        distractorCharacter: alternative,
        correctTone: sourceTone,
        distractorTone,
      });
    }
  }

  return candidates;
};

/**
 * @param {string} transcript
 * @returns {DistractorCandidate[]}
 */
export const listDistractorCandidates = (transcript) => shuffle(listDistractorCandidatesInternal(transcript));
