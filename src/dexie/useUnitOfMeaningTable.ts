import { db } from './db'
import type { UnitOfMeaning } from '../types/UnitOfMeaning'

export async function addUnitOfMeaning(uom: Omit<UnitOfMeaning, 'id'>) {
  return await db.unitOfMeanings.add(uom)
}

export async function getUnitOfMeaningById(id: number) {
  return await db.unitOfMeanings.get(id)
}
