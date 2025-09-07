import type { ResourceData } from './ResourceData';

export interface ResourceListFilters {
  searchQuery?: string;
  languages?: string[];
  origins?: string[];
}

export interface ResourceRepoContract {
  getAllResources(): Promise<ResourceData[]>;
  getResourceById(uid: string): Promise<ResourceData | undefined>;
  getResourceByTitleAndLanguage(title: string, language: string): Promise<ResourceData | undefined>;
  getRandomDueResource(languages?: string[], setsToAvoid?: string[]): Promise<ResourceData | null>;
  getValidImmersionResources(languages: string[]): Promise<ResourceData[]>;
  getResourcesPaginated(offset: number, limit: number, filters?: ResourceListFilters): Promise<ResourceData[]>;
  getTotalResourcesCount(filters?: ResourceListFilters): Promise<number>;
  saveResource(resource: Omit<ResourceData, 'uid' | 'tasks' | 'lastShownAt'>): Promise<ResourceData>;
  updateResource(resource: ResourceData): Promise<ResourceData>;
  deleteResource(uid: string): Promise<void>;
  disconnectVocabFromResource(resourceUid: string, vocabUid: string): Promise<void>;
}