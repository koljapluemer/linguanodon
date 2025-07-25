export type { ImmersionContentData } from './ImmersionContentData';
export type { ImmersionContentRepository } from './ImmersionContentRepository';
export { ImmersionContentDexieRepository } from './ImmersionContentDexieRepository';

import { ImmersionContentDexieRepository } from './ImmersionContentDexieRepository';
import type { ImmersionContentServiceContract } from './contracts';
import type { ImmersionContentData } from './ImmersionContentData';

const immersionContentRepo = new ImmersionContentDexieRepository();

/**
 * Service for managing immersion content, providing CRUD and random selection.
 */
export const immersionContentService: ImmersionContentServiceContract = {
  /** Get all immersion content. */
  getAll: () => immersionContentRepo.getAll(),
  /** Get an immersion content item by ID. */
  getById: async (uid: string) => {
    const result = await immersionContentRepo.getById(uid);
    return result || null;
  },
  /** Add a new immersion content item. */
  add: (content: ImmersionContentData) => immersionContentRepo.add(content),
  /** Update an existing immersion content item. */
  update: (content: ImmersionContentData) => immersionContentRepo.update(content),
  /** Delete an immersion content item by ID. */
  delete: (uid: string) => immersionContentRepo.delete(uid),
  /** Get a random immersion content item. */
  getRandom: async () => {
    const result = await immersionContentRepo.getRandom();
    return result || null;
  }
}; 