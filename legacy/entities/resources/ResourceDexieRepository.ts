import Dexie from "dexie";
import type { Table } from "dexie";
import type { ResourceData } from "./ResourceData";
import type { ResourceRepository } from "./ResourceRepository";
import resourceExampleData from "./resourceExampleData.json";

/**
 * Dexie database for storing ResourceData entities.
 */
class ResourceDexieDB extends Dexie {
  /**
   * Dexie table for ResourceData entities, keyed by uid.
   */
  resources!: Table<ResourceData, string>; // uid as key
  
  /**
   * Initializes the Dexie database and sets up the schema for resources.
   */
  constructor() {
    super("ResourceDexieDB");
    this.version(1).stores({
      resources: "uid, language, title, isUserCreated, isExploited, priority"
    });
  }
}

const db = new ResourceDexieDB();

// Populate DB on first load
(async () => {
  const count = await db.resources.count();
  if (count === 0) {
    // Convert date strings to Date objects for the demo data
    const processedData = resourceExampleData.map(resource => ({
      ...resource,
      lastDownloadedAt: resource.lastDownloadedAt ? new Date(resource.lastDownloadedAt) : null,
      lastIteratedAt: resource.lastIteratedAt ? new Date(resource.lastIteratedAt) : null,
      nextShownEarliestAt: new Date(resource.nextShownEarliestAt)
    })) as ResourceData[];
    
    await db.resources.bulkAdd(processedData);
  }
})();

/**
 * Dexie-based implementation of the ResourceRepository interface.
 */
export class ResourceDexieRepository implements ResourceRepository {
  /**
   * Get all resources from the database.
   */
  async getAll() {
    return db.resources.toArray();
  }
  
  /**
   * Get a resource by uid.
   */
  async getById(uid: string) {
    return db.resources.get(uid);
  }
  
  /**
   * Add a new resource to the database.
   */
  async add(resource: ResourceData) {
    await db.resources.add(resource);
  }
  
  /**
   * Update an existing resource in the database.
   */
  async update(resource: ResourceData) {
    await db.resources.put(resource);
  }
  
  /**
   * Delete a resource from the database by uid.
   */
  async delete(uid: string) {
    await db.resources.delete(uid);
  }

  /**
   * Get a random resource from the database.
   */
  async getRandom() {
    const count = await db.resources.count();
    if (count === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * count);
    return db.resources.offset(randomIndex).first();
  }
} 