// @ts-check

/**
 * @typedef {import('../types.js').GlossKey} GlossKey
 * @typedef {import('../types.js').LanguageCode} LanguageCode
 */

/**
 * @typedef {Object} LanguageOption
 * @property {LanguageCode} code
 * @property {string} displayName
 */

/**
 * @typedef {Object} GlossPrompt
 * @property {string} text
 * @property {string | null} audioUrl
 */

/** @typedef {Record<string, unknown> & { audio?: Partial<Record<LanguageCode, string>> }} GlossEntry */
/** @typedef {Record<GlossKey, GlossEntry>} Glosses */
/** @typedef {Record<LanguageCode, string>} Languages */

/** @type {Glosses | null} */
let glosses = null
/** @type {Languages | null} */
let languages = null

export const DEFAULT_LANGUAGE = 'deu'

/**
 * @param {string} apiLanguagesUrl
 * @param {string} apiGlossaryUrl
 * @returns {Promise<void>}
 */
export async function loadGlossaryData(apiLanguagesUrl, apiGlossaryUrl) {
  const [loadedGlosses, loadedLanguages] = await Promise.all([
    fetchJson(apiGlossaryUrl),
    fetchJson(apiLanguagesUrl),
  ])
  glosses = /** @type {Glosses} */ (loadedGlosses)
  languages = /** @type {Languages} */ (loadedLanguages)
}

/** @returns {LanguageOption[]} */
export function getLanguageOptions() {
  return Object.entries(getLanguages()).map(([code, displayName]) => ({
    code,
    displayName,
  }))
}

/**
 * @param {GlossKey} glossKey
 * @param {LanguageCode} language
 * @returns {boolean}
 */
export function hasGloss(glossKey, language) {
  return typeof getGlosses()[glossKey]?.[language] === 'string'
}

/**
 * @param {GlossKey} glossKey
 * @param {LanguageCode} language
 * @returns {string}
 */
export function getGloss(glossKey, language) {
  const entry = getGlosses()[glossKey]
  const localized = entry?.[language]
  const english = entry?.eng
  if (typeof localized === 'string') return localized
  if (typeof english === 'string') return english
  return glossKey
}

/**
 * @param {GlossKey} glossKey
 * @param {LanguageCode} language
 * @returns {string | null}
 */
export function getGlossAudioUrl(glossKey, language) {
  return getGlosses()[glossKey]?.audio?.[language] ?? null
}

/**
 * @param {GlossKey} glossKey
 * @param {LanguageCode} language
 * @returns {GlossPrompt}
 */
export function getGlossPrompt(glossKey, language) {
  return {
    text: getGloss(glossKey, language),
    audioUrl: getGlossAudioUrl(glossKey, language),
  }
}

/**
 * @param {GlossKey[]} glossKeys
 * @param {LanguageCode} language
 * @returns {GlossKey[]}
 */
export function getGlossKeysWithLanguage(glossKeys, language) {
  return glossKeys.filter((glossKey) => hasGloss(glossKey, language))
}

/**
 * @param {string} url
 * @returns {Promise<unknown>}
 */
async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load glossary data "${url}": ${response.status} ${response.statusText}`)
  }
  return response.json()
}

/** @returns {Glosses} */
function getGlosses() {
  if (!glosses) throw new Error('Glossary data has not loaded.')
  return glosses
}

/** @returns {Languages} */
function getLanguages() {
  if (!languages) throw new Error('Glossary data has not loaded.')
  return languages
}
