// shape of remote data
// url: https://scintillating-empanada-730581.netlify.app/sets.json
export type RemoteSets = Record<string, string>

/**
 * Fetches all available languages from the remote API
 */
export async function getAvailableLanguages(): Promise<string[]> {
  try {
    const response = await fetch('https://scintillating-empanada-730581.netlify.app/languages.json')
    if (!response.ok) {
      console.error('Failed to fetch languages:', response.status, response.statusText)
      return []
    }
    const languages = await response.json()
    return Array.isArray(languages) ? languages : []
  } catch (error) {
    console.error('Error fetching available languages:', error)
    return []
  }
}

/**
 * Fetches available sets for a specific language from the remote API
 */
export async function getSetsForLanguage(languageCode: string): Promise<RemoteSets> {
  try {
    const response = await fetch(`https://scintillating-empanada-730581.netlify.app/${languageCode}/index.json`)
    if (!response.ok) {
      console.error(`Failed to fetch sets for language ${languageCode}:`, response.status, response.statusText)
      return {}
    }
    const sets = await response.json()
    return typeof sets === 'object' && sets !== null ? sets : {}
  } catch (error) {
    console.error(`Error fetching sets for language ${languageCode}:`, error)
    return {}
  }
}