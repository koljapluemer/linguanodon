export interface UnitOfMeaning {
    uid: string
    language: string // references Language.tag, 
    content: string
    linguType: string
    pronunciation?: string
    notes?: string

    // note: translations and synonyms are the same thing in our context
    translations?: string[] // uids of other UnitOfMeanings
    related?: string[] // uids of other UnitOfMeanings

    userCreated: boolean
    author?: string
    
    context: string
    license?: string
    owner?:string
    ownerLink?: string
    source?:string
    sourceLink?:string
}

export interface UnitOfMeaningSummary {
    uid: string
    content: string
}