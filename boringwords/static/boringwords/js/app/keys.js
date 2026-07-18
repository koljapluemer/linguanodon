// @ts-check

/**
 * @param {string} language
 * @param {number} wordId
 */
export function buildWordKey(language, wordId) {
  return `${language}:${wordId}`;
}
