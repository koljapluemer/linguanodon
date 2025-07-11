import { db } from './dexieDB'
import type { UnitOfMeaning, UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

/**
 * Dexie implementation of UnitOfMeaningRepository
 */
export function useRepoDexieUnitsOfMeaning(): UnitOfMeaningRepository {
  return {
    /**
     * Adds a new unit of meaning to the database
     */
    async addUnitOfMeaning(unitOfMeaning: UnitOfMeaning): Promise<void> {
      try {
        await db.unitsOfMeaning.add(unitOfMeaning)
      } catch (error) {
        if (error instanceof Error && error.name === 'ConstraintError') {
          throw new Error(`Unit of meaning with language ${unitOfMeaning.language} and content ${unitOfMeaning.content} already exists`)
        }
        throw error
      }
    },

    /**
     * Deletes a unit of meaning
     */
    async deleteUnitOfMeaning(unitOfMeaning: UnitOfMeaning): Promise<void> {
      await db.unitsOfMeaning.delete([unitOfMeaning.language, unitOfMeaning.content])
    },

    /**
     * Finds a unit of meaning by language and content
     */
    async findUnitOfMeaning(language: string, content: string): Promise<UnitOfMeaning | null> {
      return await db.unitsOfMeaning.get([language, content]) || null
    },

    /**
     * Gets all units of meaning from the database
     */
    async getAllUnitsOfMeaning(): Promise<UnitOfMeaning[]> {
      return await db.unitsOfMeaning.toArray()
    },

    /**
     * Gets all units of meaning for a specific language
     */
    async getAllUnitsOfMeaningByLanguage(language: string): Promise<UnitOfMeaning[]> {
      return await db.unitsOfMeaning.filter(unit => unit.language === language).toArray()
    },

    /**
     * Gets all units of meaning by identification list
     */
    async getAllUnitsOfMeaningByIdentificationList(identificationList: UnitOfMeaningIdentification[]): Promise<UnitOfMeaning[]> {
      const keys = identificationList.map(id => [id.language, id.content])
      return await db.unitsOfMeaning.bulkGet(keys).then(results => 
        results.filter((unit): unit is UnitOfMeaning => unit !== undefined)
      )
    },

    /**
     * Adds a translation to a unit of meaning
     */
    async addTranslationToUnit(unit: UnitOfMeaning, translation: UnitOfMeaningIdentification): Promise<void> {
      const existingUnit = await db.unitsOfMeaning.get([unit.language, unit.content])
      if (!existingUnit) {
        throw new Error(`Unit of meaning with language ${unit.language} and content ${unit.content} not found`)
      }
      
      // Check if translation already exists
      const translationExists = existingUnit.translations.some(
        t => t.language === translation.language && t.content === translation.content
      )
      
      if (!translationExists) {
        existingUnit.translations.push(translation)
        await db.unitsOfMeaning.put(existingUnit)
      }
    },

    /**
     * Adds a "see also" reference to a unit of meaning
     */
    async addSeeAlsoToUnit(unit: UnitOfMeaning, seeAlso: UnitOfMeaningIdentification): Promise<void> {
      const existingUnit = await db.unitsOfMeaning.get([unit.language, unit.content])
      if (!existingUnit) {
        throw new Error(`Unit of meaning with language ${unit.language} and content ${unit.content} not found`)
      }
      
      // Check if see also already exists
      const seeAlsoExists = existingUnit.seeAlso.some(
        s => s.language === seeAlso.language && s.content === seeAlso.content
      )
      
      if (!seeAlsoExists) {
        existingUnit.seeAlso.push(seeAlso)
        await db.unitsOfMeaning.put(existingUnit)
      }
    },

    /**
     * Removes a "see also" reference from a unit of meaning
     */
    async removeSeeAlsoFromUnit(unit: UnitOfMeaning, seeAlso: UnitOfMeaningIdentification): Promise<void> {
      const existingUnit = await db.unitsOfMeaning.get([unit.language, unit.content])
      if (!existingUnit) {
        throw new Error(`Unit of meaning with language ${unit.language} and content ${unit.content} not found`)
      }
      
      existingUnit.seeAlso = existingUnit.seeAlso.filter(
        s => !(s.language === seeAlso.language && s.content === seeAlso.content)
      )
      
      await db.unitsOfMeaning.put(existingUnit)
    }
  }
}
