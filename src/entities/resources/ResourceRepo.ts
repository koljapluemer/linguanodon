import type { ResourceRepoContract } from './ResourceRepoContract';
import type { ResourceData } from './ResourceData';
import { ResourceStorage } from './ResourceStorage';

export class ResourceRepo implements ResourceRepoContract {
  private storage = new ResourceStorage();

  async getAllResources(): Promise<ResourceData[]> {
    return await this.storage.getAll();
  }

  async getResourceById(uid: string): Promise<ResourceData | undefined> {
    return await this.storage.getByUID(uid);
  }

  async getRandomDueResource(): Promise<ResourceData | null> {
    const allResources = await this.storage.getAll();
    const now = new Date();
    
    // Filter to only due resources (nextShownEarliestAt does not exist or is in the past)
    const dueResources = allResources.filter(resource => 
      !resource.nextShownEarliestAt || resource.nextShownEarliestAt <= now
    );
    
    if (dueResources.length === 0) {
      return null;
    }
    
    // Pick a random resource
    const randomIndex = Math.floor(Math.random() * dueResources.length);
    return dueResources[randomIndex];
  }

  async saveResource(resource: Partial<ResourceData>): Promise<ResourceData> {
    // Validate required fields
    if (!resource.title || !resource.language) {
      throw new Error('Title and language are required');
    }

    const resourceData: ResourceData = {
      uid: resource.uid || crypto.randomUUID(),
      language: resource.language,
      priority: resource.priority || 0,
      extractedVocab: resource.extractedVocab || [],
      extractedExamples: resource.extractedExamples || [],
      extractedFactCards: resource.extractedFactCards || [],
      notes: resource.notes || [],
      isImmersionContent: resource.isImmersionContent,
      
      // Content and link fields
      content: resource.content,
      link: resource.link,
      
      // TaskData fields
      taskType: resource.taskType || 'resource',
      title: resource.title,
      prompt: resource.prompt || '',
      evaluateAfterDoing: resource.evaluateAfterDoing,
      decideWhetherToDoAgainAfterDoing: resource.decideWhetherToDoAgainAfterDoing,
      extraInfo: resource.extraInfo,
      lastShownAt: resource.lastShownAt,
      wantToDoAgain: resource.wantToDoAgain,
      nextShownEarliestAt: resource.nextShownEarliestAt,
      lastDifficultyRating: resource.lastDifficultyRating,
      lastCorrectnessRating: resource.lastCorrectnessRating,
      
      // LocalObject fields
      isUserCreated: resource.isUserCreated ?? true,
      lastDownloadedAt: resource.lastDownloadedAt || null
    };

    console.log('ResourceRepo: Attempting to save resource:', resourceData.title);
    
    try {
      await this.storage.add(resourceData);
      console.log('ResourceRepo: Successfully saved resource:', resourceData.title, resourceData.uid);
      return resourceData;
    } catch (error) {
      console.error('ResourceRepo: Failed to save resource:', error);
      throw error;
    }
  }

  async updateResource(resource: ResourceData): Promise<void> {
    await this.storage.update(resource);
  }

  async deleteResource(uid: string): Promise<void> {
    await this.storage.delete(uid);
  }
}