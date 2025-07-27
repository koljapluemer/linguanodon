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

  async saveImmersionContent(content: Partial<ImmersionContentData>): Promise<ImmersionContentData> {
    const newContent: ImmersionContentData = {
      uid: content.uid || crypto.randomUUID(),
      language: content.language || '',
      priority: content.priority || 1,
      associatedUnits: content.associatedUnits || [],
      taskType: content.taskType || 'immersion-content',
      title: content.title || '',
      prompt: content.prompt || '',
      evaluateAfterDoing: content.evaluateAfterDoing ?? true,
      extraInfo: content.extraInfo,
      lastShownAt: content.lastShownAt,
      wantToDoAgain: content.wantToDoAgain,
      nextShownEarliestAt: content.nextShownEarliestAt,
      lastDifficultyRating: content.lastDifficultyRating,
      lastCorrectnessRating: content.lastCorrectnessRating,
      isUserCreated: true,
      lastDownloadedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.storage.add(newContent);
    return newContent;
  }

  async updateImmersionContent(content: ImmersionContentData): Promise<void> {
    await this.storage.update({
      ...content,
      updatedAt: new Date()
    });
  }

  async deleteImmersionContent(uid: string): Promise<void> {
    await this.storage.delete(uid);
  }
}