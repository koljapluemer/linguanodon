// @ts-check

/**
 * @typedef {import('../types.js').LanguageOption} LanguageOption
 * @typedef {import('../types.js').LocaleTaskMap} LocaleTaskMap
 * @typedef {import('../types.js').PlacedObject} PlacedObject
 * @typedef {import('../types.js').TprboardConfig} TprboardConfig
 */

/**
 * @template T
 * @param {string} url
 * @param {string} errorMessage
 * @returns {Promise<T>}
 */
async function loadJson(url, errorMessage) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`${errorMessage} (${response.status} ${response.statusText})`)
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    const body = (await response.text()).slice(0, 120)
    throw new Error(
      `${errorMessage} (expected JSON, got ${contentType || 'unknown content type'}): ${body}`,
    )
  }

  return response.json()
}

/**
 * @param {TprboardConfig} config
 * @returns {Promise<LanguageOption[]>}
 */
export async function loadLanguageOptions(config) {
  const catalog = await loadJson(
    config.apiLanguagesUrl,
    'Failed to load language index.',
  )

  return Object.entries(/** @type {Record<string, string>} */ (catalog)).map(([code, name]) => ({
    code,
    name,
  }))
}

/**
 * @param {TprboardConfig} config
 * @param {string} languageCode
 * @returns {Promise<LocaleTaskMap>}
 */
export async function loadLocaleTaskMap(config, languageCode) {
  return loadJson(
    `${config.apiLocaleTasksBaseUrl}${languageCode}/tasks/`,
    `Failed to load locale task strings: ${languageCode}.`,
  )
}

/**
 * @param {TprboardConfig} config
 * @returns {Promise<PlacedObject[]>}
 */
export async function loadObjectPool(config) {
  return loadJson(config.apiObjectsUrl, 'Failed to load object pool.')
}
