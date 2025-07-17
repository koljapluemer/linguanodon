import Dexie, { type Table } from 'dexie'
import type { ExerciseData } from '@/entities/ExerciseData'
import type { Language } from '@/entities/Language'
import type { Set } from '@/entities/Set'
import type { Task } from '@/entities/Task'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

/**
 * Extended Language interface for Dexie with user preferences
 */
export interface DexieLanguage extends Language {
  isTarget: boolean
  isNative: boolean
  isCustom: boolean
}

/**
 * Main database class for LinguaNodon using Dexie.js
 */
export class LinguanodonDB extends Dexie {
  // Tables
  exercises!: Table<ExerciseData>
  languages!: Table<DexieLanguage>
  sets!: Table<Set>
  tasks!: Table<Task>
  unitsOfMeaning!: Table<UnitOfMeaning>

  /**
   * Initializes the database with schema version 1
   */
  constructor() {
    super('LinguanodonDB')
    
    this.version(2).stores({
      exercises: 'uid',
      languages: 'code',
      sets: 'uid',
      tasks: 'uid',
      unitsOfMeaning: '[language+content]'
    })
  }
}

// Export a singleton instance
export const db = new LinguanodonDB()
