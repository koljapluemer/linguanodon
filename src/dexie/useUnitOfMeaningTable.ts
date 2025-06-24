import { db } from './db'
import type { UnitOfMeaning } from '../types/UnitOfMeaning'

export async function addUnitOfMeaning(uom: Omit<UnitOfMeaning, 'id'>) {
  return await db.unitOfMeanings.add(uom)
}

export async function getUnitOfMeaningById(id: number) {
  return await db.unitOfMeanings.get(id)
}

export async function connectUnitsAsTranslations(id1: number, id2: number) {
  if (id1 === id2) return
  const [uom1, uom2] = await Promise.all([
    db.unitOfMeanings.get(id1),
    db.unitOfMeanings.get(id2)
  ])
  if (!uom1 || !uom2) return
  const t1 = new Set(uom1.translations || [])
  const t2 = new Set(uom2.translations || [])
  t1.add(id2)
  t2.add(id1)
  await Promise.all([
    db.unitOfMeanings.update(id1, { translations: Array.from(t1) }),
    db.unitOfMeanings.update(id2, { translations: Array.from(t2) })
  ])
}
