import { goalStorage } from './GoalStorage';
import type { GoalData } from './GoalData';
import type { GoalRepoContract } from './GoalRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';

export class GoalRepo implements GoalRepoContract {
  async getAll(): Promise<GoalData[]> {
    return await goalStorage.goals.toArray();
  }

  async getById(id: string): Promise<GoalData | undefined> {
    return await goalStorage.goals.get(id);
  }

  async create(goalData: Omit<GoalData, 'id' | 'isUserCreated' | 'lastDownloadedAt' | 'coreTasks'>): Promise<GoalData> {
    const id = crypto.randomUUID();
    
    // Generate core tasks when goal is created
    const coreTasks: TaskData[] = [
      {
        uid: crypto.randomUUID(),
        taskType: 'add-sub-goals',
        title: 'Add Sub-Goals',
        prompt: 'Add smaller goals that help you achieve this larger goal',
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: true,
        isActive: true,
        taskSize: 'big',
        associatedUnits: []
      },
      {
        uid: crypto.randomUUID(),
        taskType: 'add-vocab-to-goal',
        title: 'Add Vocabulary',
        prompt: 'Add vocabulary that you need to learn for this goal',
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: true,
        isActive: true,
        taskSize: 'big',
        associatedUnits: []
      },
      {
        uid: crypto.randomUUID(),
        taskType: 'add-examples-to-goal',
        title: 'Add Examples',
        prompt: 'Add example sentences or phrases related to this goal',
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: true,
        isActive: true,
        taskSize: 'big',
        associatedUnits: []
      },
      {
        uid: crypto.randomUUID(),
        taskType: 'add-milestones',
        title: 'Add Milestones',
        prompt: 'Add specific milestones to track your progress toward this goal',
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: true,
        isActive: true,
        taskSize: 'medium',
        associatedUnits: []
      }
    ];

    const goal: GoalData = {
      ...goalData,
      uid: id,
      isUserCreated: true,
      lastDownloadedAt: null,
      coreTasks,
      taskType: 'complete-goal'
    };

    await goalStorage.goals.add(goal);
    return goal;
  }

  async update(id: string, updates: Partial<GoalData>): Promise<GoalData> {
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
    return allGoals.filter(goal => goal.isActive !== false);
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