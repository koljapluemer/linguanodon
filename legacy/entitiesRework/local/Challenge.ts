// examples:
// - record yourself counting to twenty
// - explain the route from one place to the other on this map
// very likely not auto-generated, at least not based on sources (maybe AI)

import type { UnitOfMeaningIdentification } from "@/entities/unitOfMeaning/abstractUnitOfMeaning/AbstractUnitOfMeaning"

export interface Challenge {
    uid: string
    language: string
    title: string
    content: string

    unitsRequiredToUnlock: UnitOfMeaningIdentification[]
}

