// Resource-related exports
export type { ResourceData } from "./ResourceData";
export type { ResourceRepository } from "./ResourceRepository";
export { ResourceDexieRepository } from "./ResourceDexieRepository";

// Service functions
import { ResourceDexieRepository } from "./ResourceDexieRepository";
import type { ResourceServiceContract } from "./contracts";
import type { ResourceData } from "./ResourceData";

// Initialize repository (singleton pattern)
const resourceRepo = new ResourceDexieRepository();

// Resource service functions - implements ResourceServiceContract
export const resourceService: ResourceServiceContract = {
  /**
   * Get all resources.
   */
  getAll: () => resourceRepo.getAll(),
  
  /**
   * Get resource by ID.
   */
  getById: async (uid: string) => {
    const result = await resourceRepo.getById(uid);
    return result || null;
  },
  
  /**
   * Add a new resource.
   */
  add: (resource: ResourceData) => resourceRepo.add(resource),
  
  /**
   * Update an existing resource.
   */
  update: (resource: ResourceData) => resourceRepo.update(resource),
  
  /**
   * Delete a resource.
   */
  delete: (uid: string) => resourceRepo.delete(uid),
  
  /**
   * Get a random resource.
   */
  getRandom: async () => {
    const result = await resourceRepo.getRandom();
    return result || null;
  },
  
  /**
   * Get resources with pagination.
   */
  getAllPaginated: async (page: number, pageSize: number) => {
    const all = await resourceRepo.getAll();
    const start = page * pageSize;
    return all.slice(start, start + pageSize);
  },
  
  /**
   * Get all resources in a specific language.
   */
  getAllInLanguage: async (languageCode: string) => {
    const all = await resourceRepo.getAll();
    return all.filter(resource => resource.language === languageCode);
  },
  
  /**
   * Get a random resource in a specific language.
   */
  getRandomInLanguage: async (languageCode: string) => {
    const all = await resourceRepo.getAll();
    const filtered = all.filter(resource => resource.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  
  /**
   * Get all resources that are not exploited.
   */
  getAllNotExploited: async () => {
    const all = await resourceRepo.getAll();
    return all.filter(resource => !resource.isExploited);
  },
  
  /**
   * Get all resources due for review.
   */
  getAllDueForReview: async () => {
    const all = await resourceRepo.getAll();
    const now = new Date();
    return all.filter(resource => 
      !resource.isExploited && 
      new Date(resource.nextShownEarliestAt) <= now
    );
  },
  
  /**
   * Get a random resource due for review.
   */
  getRandomDueForReview: async () => {
    const dueResources = await resourceService.getAllDueForReview();
    return dueResources.length > 0 ? dueResources[Math.floor(Math.random() * dueResources.length)] : null;
  }
}; 