import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { UnitOfMeaning } from '../types/UnitOfMeaning'

export class AppDatabase extends Dexie {
  unitOfMeanings!: Table<UnitOfMeaning, number>

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      unitOfMeanings: '++id, languageCode, content, wordType',
      // Add more tables here in the future
    })
  }
}

export const db = new AppDatabase()

export async function addUnitOfMeaning(uom: Omit<UnitOfMeaning, 'id'>) {
  return await db.unitOfMeanings.add(uom)
}

export async function getUnitOfMeaningById(id: number) {
  return await db.unitOfMeanings.get(id)
}
