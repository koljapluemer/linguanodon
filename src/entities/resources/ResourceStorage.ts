import Dexie, { type Table } from 'dexie';
import type { ResourceData } from './ResourceData';

class ResourceDatabase extends Dexie {
  resources!: Table<ResourceData>;

  constructor() {
    super('ResourceDatabase');
    this.version(1).stores({
      resources: 'uid, language'
    });
  }
}

const db = new ResourceDatabase();

export class ResourceStorage {
  async getAll(): Promise<ResourceData[]> {
    const resources = await db.resources.toArray();
    console.log('ResourceStorage: Retrieved', resources.length, 'resources');
    return resources;
  }

  async getByUID(uid: string): Promise<ResourceData | undefined> {
    return await db.resources.get(uid);
  }

  async add(resource: ResourceData): Promise<void> {
    console.log('ResourceStorage: Adding resource to DB:', resource.title);
    try {
      await db.resources.add(resource);
      console.log('ResourceStorage: Successfully added resource to DB:', resource.title);
    } catch (error) {
      console.error('ResourceStorage: Failed to add resource to DB:', error);
      throw error;
    }
  }

  async update(resource: ResourceData): Promise<void> {
    await db.resources.put(resource);
  }

  async delete(uid: string): Promise<void> {
    await db.resources.delete(uid);
  }

  async count(): Promise<number> {
    return await db.resources.count();
  }

}