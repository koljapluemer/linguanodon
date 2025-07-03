import { db } from '@/modules/db/db-local/accessLocalDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

/**
 * Fetches all units of meaning from the local Dexie DB.
 */
export async function getAllUnitsOfMeaning(): Promise<UnitOfMeaning[]> {
  return db.unitsOfMeaning.toArray()
}
