import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

/**
 * Returns all due units of meaning, sorted by priority (lower = higher priority).
 * Filters out blacklisted units and those not due yet.
 */
export async function getDueUnitsOfMeaning(
  unitRepo: UnitOfMeaningRepository
): Promise<UnitOfMeaning[]> {
  const allUnits = await unitRepo.getAllUnitsOfMeaning()
  const now = new Date()
  const dueUnits = allUnits.filter(u => u.card && u.card.due && new Date(u.card.due) <= now && !u.isBlacklisted)
  dueUnits.sort((a, b) => (a.priority ?? 1) - (b.priority ?? 1))
  return dueUnits
}
