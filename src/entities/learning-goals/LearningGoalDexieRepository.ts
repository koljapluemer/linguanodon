import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { LearningGoalData } from './LearningGoalData';
import type { LearningGoalRepository } from './LearningGoalRepository';
import learningGoalExampleData from './learningGoalExampleData.json';

/**
 * Dexie database for storing LearningGoalData entities.
 */
class LearningGoalDexieDB extends Dexie {
  /**
   * Dexie table for LearningGoalData entities, keyed by uid.
   */
  learningGoals!: Table<LearningGoalData, string>;

  /**
   * Initializes the Dexie database and sets up the schema for learning goals.
   */
  constructor() {
    super('LearningGoalDexieDB');
    this.version(1).stores({
      learningGoals: 'uid, language, title'
    });
  }
}

const db = new LearningGoalDexieDB();

// Populate DB on first load
(async () => {
  const count = await db.learningGoals.count();
  if (count === 0) {
    await db.learningGoals.bulkAdd(learningGoalExampleData as LearningGoalData[]);
  }
})();

/**
 * Dexie-based implementation of the LearningGoalRepository interface.
 */
export class LearningGoalDexieRepository implements LearningGoalRepository {
  /**
   * Get all learning goals from the database.
   */
  async getAll() {
    return db.learningGoals.toArray();
  }

  /**
   * Get a learning goal by uid.
   */
  async getById(uid: string) {
    return db.learningGoals.get(uid);
  }

  /**
   * Add a new learning goal to the database.
   */
  async add(goal: LearningGoalData) {
    await db.learningGoals.add(goal);
  }

  /**
   * Update an existing learning goal in the database.
   */
  async update(goal: LearningGoalData) {
    await db.learningGoals.put(goal);
  }

  /**
   * Delete a learning goal from the database by uid.
   */
  async delete(uid: string) {
    await db.learningGoals.delete(uid);
  }

  /**
   * Get a random learning goal from the database.
   */
  async getRandom() {
    const count = await db.learningGoals.count();
    if (count === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * count);
    return db.learningGoals.offset(randomIndex).first();
  }
} 