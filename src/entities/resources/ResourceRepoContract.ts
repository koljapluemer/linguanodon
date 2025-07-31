import type { ResourceData } from './ResourceData';

export interface ResourceRepoContract {
  getAllResources(): Promise<ResourceData[]>;
  getResourceById(uid: string): Promise<ResourceData | undefined>;
  getRandomDueResource(): Promise<ResourceData | null>;
  saveResource(resource: Partial<ResourceData>): Promise<ResourceData>;
  updateResource(resource: ResourceData): Promise<void>;
  deleteResource(uid: string): Promise<void>;
}