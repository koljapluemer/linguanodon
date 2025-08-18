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

  async getResourceByTitleAndLanguage(title: string, language: string): Promise<ResourceData | undefined> {
    const allResources = await this.storage.getAll();
    return allResources.find(resource => 
      resource.title === title && resource.language === language
    );
  }

  async getRandomDueResource(): Promise<ResourceData | null> {
    const allResources = await this.storage.getAll();
    
    if (allResources.length === 0) {
      return null;
    }
    
    // Pick a random resource
    const randomIndex = Math.floor(Math.random() * allResources.length);
    return allResources[randomIndex];
  }

  async saveResource(resource: Omit<ResourceData, 'uid' | 'tasks' | 'lastShownAt'>): Promise<ResourceData> {
    const resourceData: ResourceData = {
      uid: crypto.randomUUID(),
      language: resource.language,
      title: resource.title,
      content: resource.content,
      link: resource.link,
      priority: resource.priority,
      vocab: resource.vocab,
      factCards: resource.factCards,
      notes: resource.notes,
      origins: resource.origins,
      tasks: []
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

  async disconnectVocabFromResource(resourceUid: string, vocabUid: string): Promise<void> {
    const resource = await this.storage.getByUID(resourceUid);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Remove the vocab UID from the extractedVocab array
    const updatedResource: ResourceData = {
      ...resource,
      vocab: resource.vocab.filter(id => id !== vocabUid)
    };

    await this.storage.update(updatedResource);
  }
}