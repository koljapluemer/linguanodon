import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

/**
 * Makes two units of meaning show up in each other's seeAlso lists
 * This creates a bidirectional relationship between the units
 */
export async function makeTwoUnitsOfMeaningShowUpInEachOthersSeeAlso(
  unitA: UnitOfMeaning,
  unitB: UnitOfMeaning,
  repository: UnitOfMeaningRepository
): Promise<void> {
  // Check if the relationship already exists
  const unitAHasB = unitA.seeAlso.some(
    seeAlso => seeAlso.language === unitB.language && seeAlso.content === unitB.content
  )
  
  const unitBHasA = unitB.seeAlso.some(
    seeAlso => seeAlso.language === unitA.language && seeAlso.content === unitA.content
  )

  // Add unit B to unit A's seeAlso if not already present
  if (!unitAHasB) {
    await repository.addSeeAlsoToUnit(unitA, { language: unitB.language, content: unitB.content })
  }

  // Add unit A to unit B's seeAlso if not already present
  if (!unitBHasA) {
    await repository.addSeeAlsoToUnit(unitB, { language: unitA.language, content: unitA.content })
  }
}
