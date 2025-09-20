import Dexie, { type Table } from 'dexie';
import type { GoalData } from './GoalData';
import type { GoalRepoContract, GoalListFilters } from './GoalRepoContract';

class GoalDatabase extends Dexie {
  goals!: Table<GoalData>;

  constructor() {
    super('GoalStorage');
    this.version(1).stores({
      goals: 'uid, taskType, title, isActive, parentGoal, lastShownAt, *subGoals, *vocab, *examples, *factCards, *notes'
    });
  }
}

export class GoalRepo implements GoalRepoContract {
  private db = new GoalDatabase();

  async getAll(): Promise<GoalData[]> {
    return await this.db.goals.toArray();
  }

  async getById(id: string): Promise<GoalData | undefined> {
    return await this.db.goals.get(id);
  }

  async create(goalData: Omit<GoalData, 'uid'>): Promise<GoalData> {
    const goal: GoalData = {
      ...goalData,
      uid: crypto.randomUUID(),
      finishedAddingSubGoals: goalData.finishedAddingSubGoals ?? false,
      finishedAddingMilestones: goalData.finishedAddingMilestones ?? false,
      finishedAddingKnowledge: goalData.finishedAddingKnowledge ?? false,
      milestones: goalData.milestones ?? {}
    };

    await this.db.goals.add(goal);
    return goal;
  }

  async update(id: string, updates: Omit<Partial<GoalData>, 'uid'>): Promise<GoalData> {
    await this.db.goals.update(id, updates);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Goal with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.goals.delete(id);
  }

  async getGoalByTitleAndLanguage(title: string, language: string): Promise<GoalData | undefined> {
    return await this.db.goals
      .filter(goal => goal.title === title && goal.language === language)
      .first();
  }

  async getIncompleteGoals(): Promise<GoalData[]> {
    const allGoals = await this.db.goals.toArray();
    return allGoals; // All goals are considered active since isActive was removed
  }

  async getGoalsNeedingVocab(languages: string[]): Promise<GoalData[]> {
    const allGoals = await this.db.goals.toArray();
    return allGoals.filter(goal => 
      languages.includes(goal.language) &&
      !goal.isAchieved &&
      !goal.doNotPractice &&
      !goal.finishedAddingKnowledge
    );
  }

  async getGoalsNeedingSubGoals(languages: string[]): Promise<GoalData[]> {
    const allGoals = await this.db.goals.toArray();
    return allGoals.filter(goal => 
      languages.includes(goal.language) &&
      !goal.isAchieved &&
      !goal.doNotPractice &&
      !goal.finishedAddingSubGoals
    );
  }

  async getSubGoals(parentId: string): Promise<GoalData[]> {
    const parentGoal = await this.getById(parentId);
    if (!parentGoal) return [];
    
    const subGoalPromises = parentGoal.subGoals.map(id => this.getById(id));
    const subGoals = await Promise.all(subGoalPromises);
    
    return subGoals.filter((goal): goal is GoalData => goal !== undefined);
  }

  async getRootGoals(): Promise<GoalData[]> {
    return await this.db.goals
      .where('subGoals')
      .equals([])
      .toArray();
  }

  async getParentGoal(goalId: string): Promise<GoalData | undefined> {
    return await this.db.goals
      .where('subGoals')
      .anyOf([goalId])
      .first();
  }

  private applyFilters(goals: GoalData[], filters?: GoalListFilters): GoalData[] {
    if (!filters) return goals;
    
    let filtered = goals;

    // Search filter
    if (filters.searchQuery?.trim()) {
      const query = filters.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(goal => {
        // Search in title
        if (goal.title.toLowerCase().includes(query)) return true;
        
        // Search in milestones
        if (goal.milestones) {
          const milestoneKeys = Object.keys(goal.milestones);
          if (milestoneKeys.some(milestone => milestone.toLowerCase().includes(query))) return true;
        }
        
        return false;
      });
    }

    // Language filter
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter(goal => filters.languages!.includes(goal.language));
    }

    // Origins filter
    if (filters.origins && filters.origins.length > 0) {
      filtered = filtered.filter(goal => 
        goal.origins.some(origin => filters.origins!.includes(origin))
      );
    }

    return filtered;
  }

  async getGoalsPaginated(offset: number, limit: number, filters?: GoalListFilters): Promise<GoalData[]> {
    const allGoals = await this.db.goals.toArray();
    const filtered = this.applyFilters(allGoals, filters);
    
    // Sort by lastShownAt descending (most recent first), then by title
    filtered.sort((a, b) => {
      if (a.lastShownAt && b.lastShownAt) {
        return b.lastShownAt.getTime() - a.lastShownAt.getTime();
      }
      if (a.lastShownAt && !b.lastShownAt) return -1;
      if (!a.lastShownAt && b.lastShownAt) return 1;
      return a.title.localeCompare(b.title);
    });
    
    return filtered.slice(offset, offset + limit);
  }

  async getTotalGoalsCount(filters?: GoalListFilters): Promise<number> {
    const allGoals = await this.db.goals.toArray();
    const filtered = this.applyFilters(allGoals, filters);
    return filtered.length;
  }
}