import type { ResourceData } from './ResourceData';

export interface ResourceRepoContract {
  getAllResources(): Promise<ResourceData[]>;
  getResourceById(uid: string): Promise<ResourceData | undefined>;
  getResourceByTitleAndLanguage(title: string, language: string): Promise<ResourceData | undefined>;
  getRandomDueResource(languages?: string[], setsToAvoid?: string[]): Promise<ResourceData | null>;
  getValidImmersionResources(languages: string[]): Promise<ResourceData[]>;
  saveResource(resource: Omit<ResourceData, 'uid' | 'tasks' | 'lastShownAt'>): Promise<ResourceData>;
  updateResource(resource: ResourceData): Promise<ResourceData>;
  deleteResource(uid: string): Promise<void>;
  disconnectVocabFromResource(resourceUid: string, vocabUid: string): Promise<void>;
}