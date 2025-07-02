import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { UnitOfMeaning } from '../types/UnitOfMeaning'
import type { Language } from '@/types/persistent-general-data/Language'
import type { UserSettings } from '@/types/per-user-data/UserSettings'

export class AppDatabase extends Dexie {
  unitOfMeanings!: Table<UnitOfMeaning, number>
  languages!: Table<Language, string> // key is tag
  userSettings!: Table<UserSettings & { id: number }, number>

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      unitOfMeanings: '++id, languageName, content, wordType',
      languages: 'tag, englishName, nativeName, abbreviation',
      userSettings: 'id',
    })
  }
}

export const db = new AppDatabase() 