// shape of remote data
// example url: https://scintillating-empanada-730581.netlify.app/minimal_example.json
interface RemoteSet {
    name: string
    language: string
    tasks: RemoteTask[]
}

interface RemoteTask {
    content: string
    language: string
    primaryUnitsofMeaning: RemoteUnitOfMeaning[]
    unitsOfMeaning?: RemoteUnitOfMeaning[]
}

interface RemoteUnitOfMeaning {
    language: string
    content: string,
    notes?: string,
    translations?: string[] // array of other unit of meanings referenced by "$language_$content"
    credits?: RemoteCredit[]
}

interface RemoteCredit {
    license: string
    owner?: string
    ownerLink?: string
    source?: string
    sourceLink?: string
}