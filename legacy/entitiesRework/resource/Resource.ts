import type { FactFlashcard } from "@/entities/local/FactFlashcard"
import type { UnitOfMeaningIdentification } from "@/entities/unitOfMeaning/parts/UnitOfMeaningIdentification"

// examples:
// - post on learn_arabic
// - TT video in Arabic

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

    license?: string;
    owner?: string;
    ownerLink?: string;
    source?: string;
    sourceLink?: string;
}

