// possibly kill this interface, kind of silly. 
// ...since it's a singleton anyways, the store is kind of enough

export interface UserSettings {
    primaryNativeLanguages: string[] // array of Language.name
    secondaryNativeLanguages: string[] // array of Language.name
    primaryTargetLanguages: string[] // array of Language.name
    secondaryTargetLanguages: string[] // array of Language.name
}