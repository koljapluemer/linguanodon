import Dexie from "dexie";
import type { Table } from "dexie";
import type { LearningEventData } from "./LearningEventData";
import type { LearningEventRepository } from "./LearningEventRepository";

/**
 * Dexie database for storing LearningEventData entities.
 */
class LearningEventDexieDB extends Dexie {
  /**
   * Dexie table for LearningEventData entities.
   */
  learningEvents!: Table<LearningEventData, number>;
  /**
   * Initializes the Dexie database and sets up the schema for learning events.
   */
  constructor() {
    super("LearningEventDexieDB");
    this.version(1).stores({
      learningEvents: "++id,timestamp"
    });
  }
}

const db = new LearningEventDexieDB();

/**
 * Dexie-based implementation of the LearningEventRepository interface.
 */
export class LearningEventDexieRepository implements LearningEventRepository {
  /**
   * Get all learning events from the database.
   */
  async getAll() {
    return db.learningEvents.toArray();
  }
  /**
   * Add a new learning event to the database.
   */
  async add(event: LearningEventData) {
    await db.learningEvents.add(event);
  }
  /**
   * Clear all learning events from the database.
   */
  async clear() {
    await db.learningEvents.clear();
  }
} 