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
    // Also remove this goal from any parent's subGoals array
    const goal = await this.getById(id);
    if (goal?.parentGoal) {
      const parent = await this.getById(goal.parentGoal);
      if (parent) {
        const updatedSubGoals = parent.subGoals.filter(subId => subId !== id);
        await this.update(goal.parentGoal, { subGoals: updatedSubGoals });
      }
    }

    // Remove parent reference from all sub-goals
    const subGoals = await this.getSubGoals(id);
    for (const subGoal of subGoals) {
      await this.update(subGoal.uid, { parentGoal: undefined });
    }

    await goalStorage.goals.delete(id);
  }

  async getIncompleteGoals(): Promise<GoalData[]> {
    const allGoals = await goalStorage.goals.toArray();
    return allGoals; // All goals are considered active since isActive was removed
  }

  async getSubGoals(parentId: string): Promise<GoalData[]> {
    return await goalStorage.goals
      .where('parentGoal')
      .equals(parentId)
      .toArray();
  }

  async getRootGoals(): Promise<GoalData[]> {
    const allGoals = await goalStorage.goals.toArray();
    return allGoals.filter(goal => goal.parentGoal === undefined);
  }
}