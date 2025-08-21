import { goalStorage } from './GoalStorage';
import type { GoalData } from './GoalData';
import type { GoalRepoContract } from './GoalRepoContract';

export class GoalRepo implements GoalRepoContract {
  async getAll(): Promise<GoalData[]> {
    return await goalStorage.goals.toArray();
  }

  async getById(id: string): Promise<GoalData | undefined> {
    return await goalStorage.goals.get(id);
  }

  async create(goalData: Omit<GoalData, 'uid' | 'tasks'>): Promise<GoalData> {
    const goal: GoalData = {
      ...goalData,
      uid: crypto.randomUUID(),
      tasks: [] // Tasks will be created by a feature layer
    };

    await goalStorage.goals.add(goal);
    return goal;
  }

  async update(id: string, updates: Omit<Partial<GoalData>, 'uid' | 'tasks'>): Promise<GoalData> {
    await goalStorage.goals.update(id, updates);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Goal with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await goalStorage.goals.delete(id);
  }

  async getIncompleteGoals(): Promise<GoalData[]> {
    const allGoals = await goalStorage.goals.toArray();
    return allGoals; // All goals are considered active since isActive was removed
  }

  async getSubGoals(parentId: string): Promise<GoalData[]> {
    const parentGoal = await this.getById(parentId);
    if (!parentGoal) return [];
    
    const subGoalPromises = parentGoal.subGoals.map(id => this.getById(id));
    const subGoals = await Promise.all(subGoalPromises);
    
    return subGoals.filter((goal): goal is GoalData => goal !== undefined);
  }

  async getRootGoals(): Promise<GoalData[]> {
    return await goalStorage.goals
      .where('subGoals')
      .equals([])
      .toArray();
  }

  async getParentGoal(goalId: string): Promise<GoalData | undefined> {
    return await goalStorage.goals
      .where('subGoals')
      .anyOf([goalId])
      .first();
  }
}