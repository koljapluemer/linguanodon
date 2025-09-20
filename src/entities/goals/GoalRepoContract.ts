import type { GoalData } from './GoalData';

export interface GoalListFilters {
  searchQuery?: string;
  languages?: string[];
  origins?: string[];
}

export interface GoalRepoContract {
  getAll(): Promise<GoalData[]>;
  getById(id: string): Promise<GoalData | undefined>;
  create(goal: Omit<GoalData, 'uid' | 'tasks'>): Promise<GoalData>;
  update(id: string, updates: Omit<Partial<GoalData>, 'uid' | 'tasks'>): Promise<GoalData>;
  delete(id: string): Promise<void>;

  // Existence check operations
  getGoalByTitleAndLanguage(title: string, language: string): Promise<GoalData | undefined>;
  getIncompleteGoals(): Promise<GoalData[]>;
  getGoalsNeedingVocab(languages: string[]): Promise<GoalData[]>;
  getGoalsNeedingSubGoals(languages: string[]): Promise<GoalData[]>;
  getSubGoals(parentId: string): Promise<GoalData[]>;
  getRootGoals(): Promise<GoalData[]>; // goals without parent
  getParentGoal(goalId: string): Promise<GoalData | undefined>;
  getGoalsPaginated(offset: number, limit: number, filters?: GoalListFilters): Promise<GoalData[]>;
  getTotalGoalsCount(filters?: GoalListFilters): Promise<number>;
}