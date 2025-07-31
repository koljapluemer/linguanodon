import Dexie, { type Table } from 'dexie';
import type { ResourceData } from './ResourceData';
import demoData from '@/shared/demo-data/demo.json';

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
    await this.ensureDemoData();
    return await db.resources.toArray();
  }

  async getByUID(uid: string): Promise<ResourceData | undefined> {
    await this.ensureDemoData();
    return await db.resources.get(uid);
  }

  async add(resource: ResourceData): Promise<void> {
    await db.resources.add(resource);
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

  private async ensureDemoData(): Promise<void> {
    const count = await db.resources.count();
    if (count === 0 && demoData.resources) {
      await db.resources.bulkAdd(demoData.resources as unknown as ResourceData[]);
    }
  }
}