import type { ResourceData } from "./ResourceData";

// Repository interface for accessing and managing ResourceData entities.
export interface ResourceRepository {
  getAll(): Promise<ResourceData[]>;
  getById(uid: string): Promise<ResourceData | undefined>;
  add(resource: ResourceData): Promise<void>;
  update(resource: ResourceData): Promise<void>;
  delete(uid: string): Promise<void>;
  getRandom(): Promise<ResourceData | undefined>;
} 