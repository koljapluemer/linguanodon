// Resource-related exports
export type { ResourceData } from "./ResourceData";
export type { ResourceRepository } from "./ResourceRepository";
export { ResourceDexieRepository } from "./ResourceDexieRepository";

// Service functions
import { ResourceDexieRepository } from "./ResourceDexieRepository";
import type { ResourceServiceContract } from "./contracts";

// Initialize repository (singleton pattern)
const resourceRepo = new ResourceDexieRepository();

// Resource service functions - implements ResourceServiceContract
export const resourceService: ResourceServiceContract = {
  // Basic CRUD operations
  getAll: () => resourceRepo.getAll(),
  getById: async (uid: string) => {
    const result = await resourceRepo.getById(uid);
    return result || null;
  },
  add: (resource: ResourceData) => resourceRepo.add(resource),
  update: (resource: ResourceData) => resourceRepo.update(resource),
  delete: (uid: string) => resourceRepo.delete(uid),
  
  // Pagination
  getAllPaginated: async (page: number, pageSize: number) => {
    const all = await resourceRepo.getAll();
    const start = page * pageSize;
    return all.slice(start, start + pageSize);
  },
  
  // Language-specific operations
  getAllInLanguage: async (languageCode: string) => {
    const all = await resourceRepo.getAll();
    return all.filter(resource => resource.language === languageCode);
  },
  getRandomInLanguage: async (languageCode: string) => {
    const all = await resourceRepo.getAll();
    const filtered = all.filter(resource => resource.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  
  // Status-based operations
  getAllNotExploited: async () => {
    const all = await resourceRepo.getAll();
    return all.filter(resource => !resource.isExploited);
  },
  getAllDueForReview: async () => {
    const all = await resourceRepo.getAll();
    const now = new Date();
    return all.filter(resource => 
      !resource.isExploited && 
      new Date(resource.nextShownEarliestAt) <= now
    );
  },
  getRandomDueForReview: async () => {
    const dueResources = await resourceService.getAllDueForReview();
    return dueResources.length > 0 ? dueResources[Math.floor(Math.random() * dueResources.length)] : null;
  }
}; 