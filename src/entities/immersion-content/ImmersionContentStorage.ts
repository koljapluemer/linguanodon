import Dexie, { type Table } from 'dexie';
import type { ImmersionContentData } from './ImmersionContentData';

class ImmersionContentDatabase extends Dexie {
  immersionContent!: Table<ImmersionContentData>;

  constructor() {
    super('ImmersionContentDatabase');
    this.version(1).stores({
      immersionContent: 'uid, language'
    });
  }
}

const db = new ImmersionContentDatabase();

export class ImmersionContentStorage {
  async getAll(): Promise<ImmersionContentData[]> {
    const immersionContent = await db.immersionContent.toArray();
    return immersionContent;
  }

  async getByUID(uid: string): Promise<ImmersionContentData | undefined> {
    return await db.immersionContent.get(uid);
  }

  async add(immersionContent: ImmersionContentData): Promise<void> {
    try {
      await db.immersionContent.add(immersionContent);
    } catch (error) {
      console.error('ImmersionContentStorage: Failed to add immersion content to DB:', error);
      throw error;
    }
  }

  async update(immersionContent: ImmersionContentData): Promise<void> {
    await db.immersionContent.put(immersionContent);
  }

  async delete(uid: string): Promise<void> {
    await db.immersionContent.delete(uid);
  }

  async count(): Promise<number> {
    return await db.immersionContent.count();
  }

}