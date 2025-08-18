import Dexie, { type Table } from 'dexie';
import type { LocalSetData } from './LocalSetData';

class LocalSetDatabase extends Dexie {
  localSets!: Table<LocalSetData>;

  constructor() {
    super('LocalSetDatabase');
    this.version(1).stores({
      localSets: 'uid, name, language'
    });
  }
}

const db = new LocalSetDatabase();

export class LocalSetStorage {
  async getAll(): Promise<LocalSetData[]> {
    const localSets = await db.localSets.toArray();
    return localSets;
  }

  async getByUID(uid: string): Promise<LocalSetData | undefined> {
    return await db.localSets.get(uid);
  }

  async getByName(name: string): Promise<LocalSetData | undefined> {
    return await db.localSets.where('name').equals(name).first();
  }

  async getByLanguage(language: string): Promise<LocalSetData[]> {
    return await db.localSets.where('language').equals(language).toArray();
  }

  async add(localSet: LocalSetData): Promise<void> {
    try {
      await db.localSets.add(localSet);
    } catch (error) {
      console.error('LocalSetStorage: Failed to add local set to DB:', error);
      throw error;
    }
  }

  async update(localSet: LocalSetData): Promise<void> {
    await db.localSets.put(localSet);
  }

  async delete(uid: string): Promise<void> {
    await db.localSets.delete(uid);
  }

  async count(): Promise<number> {
    return await db.localSets.count();
  }
}