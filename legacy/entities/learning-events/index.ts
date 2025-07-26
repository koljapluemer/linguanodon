// Import types and implementations
import type { LearningEventData } from "./LearningEventData";
import { LearningEventDexieRepository } from "./LearningEventDexieRepository";

// Export types
export type { LearningEventData } from "./LearningEventData";

// Initialize repository (singleton pattern)
const learningEventRepo = new LearningEventDexieRepository();

// Learning event service functions
export const learningEventService = {
  /** Get all learning events from the database */
  getAll: () => learningEventRepo.getAll(),
  /** Add a new learning event to the database */
  add: (event: LearningEventData) => learningEventRepo.add(event),
  /** Clear all learning events from the database */
  clear: () => learningEventRepo.clear()
}; 