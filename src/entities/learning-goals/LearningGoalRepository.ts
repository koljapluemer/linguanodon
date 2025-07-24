import type { LearningGoalData } from './LearningGoalData';

export interface LearningGoalRepository {
  getAll(): Promise<LearningGoalData[]>;
  getById(uid: string): Promise<LearningGoalData | undefined>;
  add(goal: LearningGoalData): Promise<void>;
  update(goal: LearningGoalData): Promise<void>;
  delete(uid: string): Promise<void>;
  getRandom(): Promise<LearningGoalData | undefined>;
} 