export interface UnitOfMeaning {
    id?: number
    languageName: string | null // references Language.name, or null if deleted
    content: string
    linguType: string
    pronunciation?: string
    notes?: string

    // note: translations and synonyms are the same thing in our context
    translations?: number[] // ids of other UnitOfMeanings
    related?: number[] // ids of other UnitOfMeanings
}