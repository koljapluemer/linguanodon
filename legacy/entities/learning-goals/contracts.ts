import type { LearningGoalData } from './LearningGoalData';

export interface LearningGoalServiceContract {
  getAll(): Promise<LearningGoalData[]>;
  getById(uid: string): Promise<LearningGoalData | null>;
  add(goal: LearningGoalData): Promise<void>;
  update(goal: LearningGoalData): Promise<void>;
  delete(uid: string): Promise<void>;
  getRandom(): Promise<LearningGoalData | null>;
} 