import type { GoalData } from './GoalData';

export interface GoalRepoContract {
  getAll(): Promise<GoalData[]>;
  getById(id: string): Promise<GoalData | undefined>;
  create(goal: Omit<GoalData, 'uid' | 'tasks'>): Promise<GoalData>;
  update(id: string, updates: Omit<Partial<GoalData>, 'uid' | 'tasks'>): Promise<GoalData>;
  delete(id: string): Promise<void>;
  getIncompleteGoals(): Promise<GoalData[]>;
  getSubGoals(parentId: string): Promise<GoalData[]>;
  getRootGoals(): Promise<GoalData[]>; // goals without parent
}