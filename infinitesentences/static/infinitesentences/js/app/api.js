// @ts-check
// Fetch wrappers hitting infinitesentences' Django JSON endpoints (replaces
// the original app's direct fetches against the static infinite-sentences-data
// submodule files).

/** @typedef {import('../types.js').LanguageDataMap} LanguageDataMap */
/** @typedef {import('../types.js').SentenceData} SentenceData */

/** @param {string} url */
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
}

/**
 * @param {string} apiLanguagesUrl
 * @returns {Promise<LanguageDataMap>}
 */
export function loadLanguages(apiLanguagesUrl) {
  return fetchJson(apiLanguagesUrl);
}

/**
 * @param {string} apiNativeLanguagesUrl
 * @returns {Promise<string[]>}
 */
export function loadNativeLanguageIsos(apiNativeLanguagesUrl) {
  return fetchJson(apiNativeLanguagesUrl);
}

/**
 * @param {string} apiTargetLanguagesUrl
 * @returns {Promise<string[]>}
 */
export function loadTargetLanguageIsos(apiTargetLanguagesUrl) {
  return fetchJson(apiTargetLanguagesUrl);
}

/**
 * @param {string} apiSentenceCountUrl
 * @returns {Promise<number>}
 */
export async function loadSentenceCount(apiSentenceCountUrl) {
  const data = await fetchJson(apiSentenceCountUrl);
  return data.count;
}

/**
 * @param {string} apiSentenceUrlTemplate
 * @param {number} index
 * @returns {Promise<SentenceData>}
 */
export function loadSentenceByIndex(apiSentenceUrlTemplate, index) {
  return fetchJson(apiSentenceUrlTemplate.replace("__INDEX__", String(index)));
}
