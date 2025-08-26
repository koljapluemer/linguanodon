import Dexie, { type Table } from 'dexie';
import type { ResourceRepoContract } from './ResourceRepoContract';
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

export class ResourceRepo implements ResourceRepoContract {
  private db = new ResourceDatabase();

  async getAllResources(): Promise<ResourceData[]> {
    return await this.db.resources.toArray();
  }

  async getResourceById(uid: string): Promise<ResourceData | undefined> {
    return await this.db.resources.get(uid);
  }

  async getResourceByTitleAndLanguage(title: string, language: string): Promise<ResourceData | undefined> {
    const allResources = await this.db.resources.toArray();
    return allResources.find(resource => 
      resource.title === title && resource.language === language
    );
  }

  async getRandomDueResource(languages?: string[], setsToAvoid?: string[]): Promise<ResourceData | null> {
    const allResources = await this.db.resources.toArray();
    
    // Filter by languages if provided
    let filteredResources = languages 
      ? allResources.filter(resource => languages.includes(resource.language))
      : allResources;
    
    // Filter out resources that are finished extracting
    filteredResources = filteredResources.filter(resource => !resource.finishedExtracting);
    
    // Filter out resources shown recently (within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    filteredResources = filteredResources.filter(resource => 
      !resource.lastShownAt || resource.lastShownAt < tenMinutesAgo
    );
    
    // Deterministically filter out resources from avoided sets if specified
    if (setsToAvoid && setsToAvoid.length > 0) {
      filteredResources = filteredResources.filter(resource =>
        !resource.origins.some(origin => setsToAvoid.includes(origin))
      );
    }
    
    if (filteredResources.length === 0) {
      return null;
    }
    
    // Pick a random resource
    const randomIndex = Math.floor(Math.random() * filteredResources.length);
    return filteredResources[randomIndex];
  }

  async saveResource(resource: Omit<ResourceData, 'uid' | 'lastShownAt'>): Promise<ResourceData> {
    const resourceData: ResourceData = {
      uid: crypto.randomUUID(),
      language: resource.language,
      isImmersionContent: resource.isImmersionContent,
      title: resource.title,
      content: resource.content,
      link: resource.link,
      priority: resource.priority,
      vocab: resource.vocab,
      factCards: resource.factCards,
      notes: resource.notes,
      origins: resource.origins,
      finishedExtracting: resource.finishedExtracting ?? false
    };

    
    try {
      await this.db.resources.add(resourceData);
      return resourceData;
    } catch (error) {
      console.error('ResourceRepo: Failed to save resource:', error);
      throw error;
    }
  }

  async updateResource(resource: ResourceData): Promise<ResourceData> {
    await this.db.resources.put(resource);
    const updated = await this.db.resources.get(resource.uid);
    if (!updated) {
      throw new Error(`Resource with uid ${resource.uid} not found after update`);
    }
    return updated;
  }

  async deleteResource(uid: string): Promise<void> {
    await this.db.resources.delete(uid);
  }

  async disconnectVocabFromResource(resourceUid: string, vocabUid: string): Promise<void> {
    const resource = await this.db.resources.get(resourceUid);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Remove the vocab UID from the extractedVocab array
    const updatedResource: ResourceData = {
      ...resource,
      vocab: resource.vocab.filter(id => id !== vocabUid)
    };

    await this.db.resources.put(updatedResource);
  }
}