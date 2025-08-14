import { UpdateGoalTasksController } from './UpdateGoalTasksController';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

let controller: UpdateGoalTasksController | null = null;

export function initializeUpdateGoalTasksService(
  goalRepo: GoalRepoContract,
  taskRepo: TaskRepoContract
) {
  controller = new UpdateGoalTasksController(goalRepo, taskRepo);
}

export async function updateGoalTasks(goalUid: string): Promise<void> {
  if (!controller) {
    throw new Error('UpdateGoalTasksService not initialized');
  }
  await controller.updateTasksForGoal(goalUid);
}

export async function updateMultipleGoalTasks(goalUids: string[]): Promise<void> {
  if (!controller) {
    throw new Error('UpdateGoalTasksService not initialized');
  }
  await controller.updateTasksForMultipleGoals(goalUids);
}