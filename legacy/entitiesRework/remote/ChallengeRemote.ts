import type { UnitOfMeaningIdentification } from "@/entities/unitOfMeaning/abstractUnitOfMeaning/AbstractUnitOfMeaning"

export interface ChallengeRemote {
    language: string
    hash: string
    title: string
    content: string

    unitsRequiredToUnlock: UnitOfMeaningIdentification[]
}

