import type { UnitOfMeaning, UnitOfMeaningIdentification } from "@/entities/UnitOfMeaning";

export interface UnitOfMeaningRepository {
    addUnitOfMeaning(unitOfMeaning: UnitOfMeaning): Promise<void>
    deleteUnitOfMeaning(unitOfMeaning: UnitOfMeaning): Promise<void>
    findUnitOfMeaning(language: string, content: string): Promise<UnitOfMeaning | null>
    getAllUnitsOfMeaning(): Promise<UnitOfMeaning[]>
    getAllUnitsOfMeaningByLanguage(language:string): Promise<UnitOfMeaning[]>
    getAllUnitsOfMeaningByIdentificationList(identificationList:UnitOfMeaningIdentification[]): Promise<UnitOfMeaning[]>
    addTranslationToUnit(unit: UnitOfMeaning, translation: UnitOfMeaningIdentification): Promise<void>
    addSeeAlsoToUnit(unit: UnitOfMeaning, seeAlso: UnitOfMeaningIdentification): Promise<void>
    removeSeeAlsoFromUnit(unit: UnitOfMeaning, seeAlso: UnitOfMeaningIdentification): Promise<void>
}