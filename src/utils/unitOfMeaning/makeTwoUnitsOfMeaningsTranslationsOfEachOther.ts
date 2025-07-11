import type { UnitOfMeaning, UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

/**
 * Makes two units of meaning mutual translations of each other.
 * This ensures that if Unit A connects to Unit B as a translation,
 * then Unit B will also have Unit A as a translation.
 */
export async function makeTwoUnitsOfMeaningsTranslationsOfEachOther(
  unitA: UnitOfMeaning,
  unitB: UnitOfMeaning,
  repository: UnitOfMeaningRepository
): Promise<void> {
  // Create identification objects for each unit
  const unitAIdentification: UnitOfMeaningIdentification = {
    language: unitA.language,
    content: unitA.content
  }
  
  const unitBIdentification: UnitOfMeaningIdentification = {
    language: unitB.language,
    content: unitB.content
  }
  
  // Check if the connection already exists to avoid duplicates
  const unitAHasUnitB = unitA.translations.some(t => 
    t.language === unitB.language && t.content === unitB.content
  )
  
  const unitBHasUnitA = unitB.translations.some(t => 
    t.language === unitA.language && t.content === unitA.content
  )
  
  // Add mutual translations if they don't already exist
  if (!unitAHasUnitB) {
    unitA.translations.push(unitBIdentification)
    await repository.addTranslationToUnit(unitA, unitBIdentification)
  }
  
  if (!unitBHasUnitA) {
    unitB.translations.push(unitAIdentification)
    await repository.addTranslationToUnit(unitB, unitAIdentification)
  }
}
