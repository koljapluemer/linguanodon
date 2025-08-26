import Dexie, { type Table } from 'dexie';
import type { GoalData } from './GoalData';
import type { GoalRepoContract } from './GoalRepoContract';

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

  async getIncompleteGoals(): Promise<GoalData[]> {
    const allGoals = await this.db.goals.toArray();
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
}