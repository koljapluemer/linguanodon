import type { LocalSetRepoContract } from './LocalSetRepoContract';
import type { LocalSetData } from './LocalSetData';
import { LocalSetStorage } from './LocalSetStorage';

export class LocalSetRepo implements LocalSetRepoContract {
  private storage = new LocalSetStorage();

  async getAllLocalSets(): Promise<LocalSetData[]> {
    return await this.storage.getAll();
  }

  async getLocalSetById(uid: string): Promise<LocalSetData | undefined> {
    return await this.storage.getByUID(uid);
  }

  async getLocalSetByName(name: string): Promise<LocalSetData | undefined> {
    return await this.storage.getByName(name);
  }

  async getLocalSetsByLanguage(language: string): Promise<LocalSetData[]> {
    return await this.storage.getByLanguage(language);
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
      await this.storage.add(localSetData);
      return localSetData;
    } catch (error) {
      console.error('LocalSetRepo: Failed to save local set:', error);
      throw error;
    }
  }

  async updateLocalSet(localSet: LocalSetData): Promise<void> {
    await this.storage.update(localSet);
  }

  async deleteLocalSet(uid: string): Promise<void> {
    await this.storage.delete(uid);
  }

  async isRemoteSetDownloaded(name: string): Promise<boolean> {
    const localSet = await this.storage.getByName(name);
    return localSet !== undefined;
  }
}