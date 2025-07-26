import type { LearningEventData } from "./LearningEventData";
 
export interface LearningEventRepository {
  getAll(): Promise<LearningEventData[]>;
  add(event: LearningEventData): Promise<void>;
  clear(): Promise<void>;
} 