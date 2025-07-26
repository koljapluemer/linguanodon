import type { LinguisticUnitIdentification } from "@/shared/LinguisticUnitIdentification"

export interface ResourceData {
    uid: string
    language: string // not which language this is in, but which language this help learning
    title: string
    link: string
    prompt: string
    extraInfo: string

    isUserCreated: boolean // did the user make this, or did they download it
    lastDownloadedAt: Date | null

    isExploited: boolean // user does not want to look at it anymore
    lastIteratedAt: Date | null
    nextShownEarliestAt: Date
    priority: number

    extractedUnits: LinguisticUnitIdentification[]
}

