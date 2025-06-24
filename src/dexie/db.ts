import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { UnitOfMeaning } from '../types/UnitOfMeaning'
import type { Language } from '../types/Language'

export class AppDatabase extends Dexie {
  unitOfMeanings!: Table<UnitOfMeaning, number>
  languages!: Table<Language, string> // key is name

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      unitOfMeanings: '++id, languageCode, content, wordType',
      languages: 'name, abbreviation, requiredByApp, position, isTargetLanguage',
    })
  }
}

export const db = new AppDatabase() 