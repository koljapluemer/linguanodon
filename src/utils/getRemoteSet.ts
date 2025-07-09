// shape of remote data
// example url: https://scintillating-empanada-730581.netlify.app/minimal_example.json
export interface RemoteSet {
    name: string
    language: string
    tasks: RemoteTask[]
}

export interface RemoteTask {
    content: string
    language: string
    primaryUnitsOfMeaning: RemoteUnitOfMeaning[]
    unitsOfMeaning?: RemoteUnitOfMeaning[]
}

export interface RemoteUnitOfMeaning {
    language: string
    content: string,
    notes?: string,
    translations?: string[] // array of other unit of meanings referenced by "$language_$content"
    credits?: RemoteCredit[]
}

export interface RemoteCredit {
    license: string
    owner?: string
    ownerLink?: string
    source?: string
    sourceLink?: string
}

/**
 * Downloads a specific set from the remote API
 */
export async function downloadSet(filename: string, language: string): Promise<RemoteSet> {
  try {
    const response = await fetch(`https://scintillating-empanada-730581.netlify.app/${language}/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to download set: ${response.status} ${response.statusText}`)
    }
    const setData = await response.json()
    return setData as RemoteSet
  } catch (error) {
    console.error(`Error downloading set ${filename} for language ${language}:`, error)
    throw error
  }
}