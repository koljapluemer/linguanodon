import type { FactFlashcard } from "@/entities/FactFlashcard"
import type { UnitOfMeaningIdentification } from "@/entities/UnitOfMeaning"

export interface Resource {
    uid: string
    language: string // not which language this is in, but which language this help learning
    title: string
    link: string
    prompt: string
    extraInfo: string
    isEducational: boolean // e.g. grammar explain article vs. immersion video
    inherentCoolness: number

    isUserCreated: boolean // did the user make this, or did they download it
    lastDownloadedAt: Date | null

    unitsRequiredForUnderstanding: UnitOfMeaningIdentification[]
    unitsHelpfulForUnderstanding: UnitOfMeaningIdentification[]

    isExploited: boolean // user does not want to look at it anymore
    lastIteratedAt: Date | null
    nextShownEarliestAt: Date
    priority: number

    extractedUnits: UnitOfMeaningIdentification[]
    extractedFactFlashcards: FactFlashcard[]
}

export interface ResourceIteration {
    successfulness: number
    understanding: number 
}