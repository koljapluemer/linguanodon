import type { ResourceData } from "./ResourceData";

/**
 * Contract for Resource service functions.
 * This interface defines the stable API that resourceService must implement.
 */
export interface ResourceServiceContract {
  // Basic CRUD operations
  getAll(): Promise<ResourceData[]>;
  getById(uid: string): Promise<ResourceData | null>;
  add(resource: ResourceData): Promise<void>;
  update(resource: ResourceData): Promise<void>;
  delete(uid: string): Promise<void>;
  
  // Pagination
  getAllPaginated(page: number, pageSize: number): Promise<ResourceData[]>;
  
  // Language-specific operations
  getAllInLanguage(languageCode: string): Promise<ResourceData[]>;
  getRandomInLanguage(languageCode: string): Promise<ResourceData | null>;
  
  // Status-based operations
  getAllNotExploited(): Promise<ResourceData[]>;
  getAllDueForReview(): Promise<ResourceData[]>;
  getRandomDueForReview(): Promise<ResourceData | null>;
} 