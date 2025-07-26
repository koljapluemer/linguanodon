import Dexie from "dexie";
import type { Table } from "dexie";
import type { LinguisticUnitProgressData } from "./LinguisticUnitProgressData";
import type { LinguisticUnitProgressRepository } from "./LinguisticUnitProgressRepository";
import type { LinguisticUnitIdentification } from "@/shared/LinguisticUnitIdentification";

/**
 * Dexie database for storing LinguisticUnitProgressData entities.
 */
class LinguisticUnitProgressDexieDB extends Dexie {
  /**
   * Dexie table for LinguisticUnitProgressData entities, keyed by [language, content, type].
   */
  progress!: Table<LinguisticUnitProgressData, [string, string, string]>;
  /**
   * Initializes the Dexie database and sets up the schema for progress.
   */
  constructor() {
    super("LinguisticUnitProgressDexieDB");
    this.version(1).stores({
      progress: "[language+content+type]"
    });
  }
}

const db = new LinguisticUnitProgressDexieDB();

/**
 * Dexie-based implementation of the LinguisticUnitProgressRepository interface.
 */
export class LinguisticUnitProgressDexieRepository implements LinguisticUnitProgressRepository {
  /**
   * Get a progress record by language, content, and type.
   */
  async get(unitId: LinguisticUnitIdentification) {
    return db.progress.get(unitId);
  }
  /**
   * Upsert a progress record.
   */
  async upsert(progress: LinguisticUnitProgressData) {
    await db.progress.put(progress);
  }
  /**
   * Get all progress records.
   */
  async getAll() {
    return db.progress.toArray();
  }
  /**
   * Clear all progress records.
   */
  async clear() {
    await db.progress.clear();
  }
} 