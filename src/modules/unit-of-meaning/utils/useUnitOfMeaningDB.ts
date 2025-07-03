import { db } from '@/modules/db/db-local/accessLocalDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

/**
 * Fetches all units of meaning from the local Dexie DB.
 */
export async function getAllUnitsOfMeaning(): Promise<UnitOfMeaning[]> {
  return db.unitsOfMeaning.toArray()
}

/**
 * Fetch a single unit of meaning by UID.
 */
export async function getUnitOfMeaningById(uid: string): Promise<UnitOfMeaning | undefined> {
  return db.unitsOfMeaning.get(uid)
}

/**
 * Add a new unit of meaning. Returns the UID.
 */
export async function addUnitOfMeaning(unit: UnitOfMeaning): Promise<string> {
  await db.unitsOfMeaning.put(unit)
  return unit.uid
}

/**
 * Update an existing unit of meaning.
 */
export async function updateUnitOfMeaning(unit: UnitOfMeaning): Promise<void> {
  await db.unitsOfMeaning.put(unit)
}

/**
 * Remove a unit of meaning by UID.
 */
export async function removeUnitOfMeaning(uid: string): Promise<void> {
  await db.unitsOfMeaning.delete(uid)
}

/**
 * Add a translation UID to a unit of meaning's translations array.
 */
export async function addTranslation(parentUid: string, translationUid: string): Promise<void> {
  const unit = await db.unitsOfMeaning.get(parentUid)
  if (!unit) return
  const translations = unit.translations ? [...unit.translations] : []
  if (!translations.includes(translationUid)) {
    translations.push(translationUid)
    await db.unitsOfMeaning.update(parentUid, { translations })
  }
}

/**
 * Remove a translation UID from a unit of meaning's translations array.
 */
export async function removeTranslation(parentUid: string, translationUid: string): Promise<void> {
  const unit = await db.unitsOfMeaning.get(parentUid)
  if (!unit || !unit.translations) return
  const translations = unit.translations.filter(uid => uid !== translationUid)
  await db.unitsOfMeaning.update(parentUid, { translations })
}
