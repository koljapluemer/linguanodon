/**
 * ## Use Cases
 * 
 * We are using a per-user database (local) to store the user's learning data, both units of meaning and learning goals as well as the progress (e.g. "last learned at").
 * 
 * ## Content of `accessLocalDB.ts`
 * 
 * - Gets our Dexie.js DB up and running
 * - Only pulls together schemas from other parts of the app
 * - Should contain no data definitions in itself
 * 
 * ## Testing
 * 
 * - Ensure that dexie DB is created and can be accessed
 */

import Dexie, { type Table } from 'dexie'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

/**
 * Local Dexie DB instance for all user data; centralizes schema and access for per-user storage.
 */
export class LinguanodonDB extends Dexie {
  learningGoals!: Table<LearningGoal, string>
  unitsOfMeaning!: Table<UnitOfMeaning, string>

  /**
   * Ensures schema changes are managed in one place for all learning data.
   */
  constructor() {
    super('LinguanodonDB')
    this.version(1).stores({
      learningGoals: 'uid',
      unitsOfMeaning: 'uid'
    })
  }
}

/**
 * Shared DB instance for all local data operations.
 */
export const db = new LinguanodonDB()