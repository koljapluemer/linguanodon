import Dexie, { type Table } from 'dexie';
import type { LocalSetRepoContract } from './LocalSetRepoContract';
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

export class LocalSetRepo implements LocalSetRepoContract {
  private db = new LocalSetDatabase();

  async getAllLocalSets(): Promise<LocalSetData[]> {
    return await this.db.localSets.toArray();
  }

  async getLocalSetById(uid: string): Promise<LocalSetData | undefined> {
    return await this.db.localSets.get(uid);
  }

  async getLocalSetByName(name: string): Promise<LocalSetData | undefined> {
    return await this.db.localSets.where('name').equals(name).first();
  }

  async getLocalSetsByLanguage(language: string): Promise<LocalSetData[]> {
    return await this.db.localSets.where('language').equals(language).toArray();
  }

  async saveLocalSet(localSet: Omit<LocalSetData, 'uid'>): Promise<LocalSetData> {
    const localSetData: LocalSetData = {
      uid: crypto.randomUUID(),
      name: localSet.name,
      language: localSet.language,
      description: localSet.description,
      lastDownloadedAt: localSet.lastDownloadedAt
    };

    
    try {
      await this.db.localSets.add(localSetData);
      return localSetData;
    } catch (error) {
      console.error('LocalSetRepo: Failed to save local set:', error);
      throw error;
    }
  }

  async updateLocalSet(localSet: LocalSetData): Promise<void> {
    await this.db.localSets.put(localSet);
  }

  async deleteLocalSet(uid: string): Promise<void> {
    await this.db.localSets.delete(uid);
  }

  async isRemoteSetDownloaded(name: string): Promise<boolean> {
    const localSet = await this.db.localSets.where('name').equals(name).first();
    return localSet !== undefined;
  }
}