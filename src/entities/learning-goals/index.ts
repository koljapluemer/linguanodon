export type { LearningGoalData, Milestone } from './LearningGoalData';
export type { LearningGoalRepository } from './LearningGoalRepository';
export { LearningGoalDexieRepository } from './LearningGoalDexieRepository';

import { LearningGoalDexieRepository } from './LearningGoalDexieRepository';
import type { LearningGoalServiceContract } from './contracts';
import type { LearningGoalData } from './LearningGoalData';

/**
 * Service for managing learning goals, providing CRUD and random selection.
 */
const learningGoalRepo = new LearningGoalDexieRepository();
export const learningGoalService: LearningGoalServiceContract = {
  /** Get all learning goals. */
  getAll: () => learningGoalRepo.getAll(),
  /** Get a learning goal by ID. */
  getById: async (uid: string) => {
    const result = await learningGoalRepo.getById(uid);
    return result || null;
  },
  /** Add a new learning goal. */
  add: (goal: LearningGoalData) => learningGoalRepo.add(goal),
  /** Update an existing learning goal. */
  update: (goal: LearningGoalData) => learningGoalRepo.update(goal),
  /** Delete a learning goal by ID. */
  delete: (uid: string) => learningGoalRepo.delete(uid),
  /** Get a random learning goal. */
  getRandom: async () => {
    const result = await learningGoalRepo.getRandom();
    return result || null;
  }
}; 