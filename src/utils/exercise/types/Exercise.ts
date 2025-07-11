import type { UnitOfMeaning } from "@/entities/UnitOfMeaning";

export interface Exercise {
    primaryUnitOfMeaning: UnitOfMeaning
    additionalUnitOfMeanings: UnitOfMeaning[]
    instructions: string
}