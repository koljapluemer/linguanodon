
export interface UnitOfMeaning {
    id?: number
    languageCode: string
    content: string
    wordType: string
    pronunciation?: string
    notes?: string

    // note: translations and synonyms are the same thing in our context
    translations?: number[] // ids of other UnitOfMeanings
    related?: number[] // ids of other UnitOfMeanings
}