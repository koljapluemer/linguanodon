import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { ImmersionContentData } from './ImmersionContentData';
import type { ImmersionContentRepository } from './ImmersionContentRepository';
import immersionContentExampleData from './immersionContentExampleData.json';

/**
 * Dexie database for storing ImmersionContentData entities.
 */
class ImmersionContentDexieDB extends Dexie {
  /**
   * Dexie table for ImmersionContentData entities, keyed by uid.
   */
  immersionContent!: Table<ImmersionContentData, string>;

  /**
   * Initializes the Dexie database and sets up the schema for immersion content.
   */
  constructor() {
    super('ImmersionContentDexieDB');
    this.version(1).stores({
      immersionContent: 'uid, language, title, isUserCreated, isExploited, priority'
    });
  }
}

const db = new ImmersionContentDexieDB();

// Populate DB on first load
(async () => {
  const count = await db.immersionContent.count();
  if (count === 0) {
    await db.immersionContent.bulkAdd(immersionContentExampleData as ImmersionContentData[]);
  }
})();

/**
 * Dexie-based implementation of the ImmersionContentRepository interface.
 */
export class ImmersionContentDexieRepository implements ImmersionContentRepository {
  /**
   * Get all immersion content from the database.
   */
  async getAll() {
    return db.immersionContent.toArray();
  }
  /**
   * Get an immersion content item by uid.
   */
  async getById(uid: string) {
    return db.immersionContent.get(uid);
  }
  /**
   * Add a new immersion content item to the database.
   */
  async add(content: ImmersionContentData) {
    await db.immersionContent.add(content);
  }
  /**
   * Update an existing immersion content item in the database.
   */
  async update(content: ImmersionContentData) {
    await db.immersionContent.put(content);
  }
  /**
   * Delete an immersion content item from the database by uid.
   */
  async delete(uid: string) {
    await db.immersionContent.delete(uid);
  }
  /**
   * Get a random immersion content item from the database.
   */
  async getRandom() {
    const count = await db.immersionContent.count();
    if (count === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * count);
    return db.immersionContent.offset(randomIndex).first();
  }
} 