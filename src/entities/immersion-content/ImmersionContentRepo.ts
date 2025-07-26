import { ImmersionContentStorage } from './ImmersionContentStorage';
import type { ImmersionContentRepoContract } from './ImmersionContentRepoContract';
import type { ImmersionContentData } from './ImmersionContentData';
import { pickRandom } from '@/shared/arrayUtils';

export class ImmersionContentRepo implements ImmersionContentRepoContract {
  private storage = new ImmersionContentStorage();

  async getAllImmersionContent(): Promise<ImmersionContentData[]> {
    return await this.storage.getAll();
  }

  async getImmersionContentById(uid: string): Promise<ImmersionContentData | undefined> {
    return await this.storage.getById(uid);
  }

  async getRandomDueImmersionContent(): Promise<ImmersionContentData | null> {
    const dueContent = await this.storage.getDueContent();
    if (dueContent.length === 0) return null;
    
    return pickRandom(dueContent, 1)[0];
  }

  async updateImmersionContent(content: ImmersionContentData): Promise<void> {
    await this.storage.update(content);
  }
}