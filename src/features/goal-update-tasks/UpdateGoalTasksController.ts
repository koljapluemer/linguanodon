import type { GoalData } from '@/entities/goals/GoalData';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { toRaw } from 'vue';

export class UpdateGoalTasksController {
  constructor(
    private goalRepo: GoalRepoContract,
    private taskRepo: TaskRepoContract
  ) {}

  /**
   * Update tasks for a goal - creates tasks if none exist or if user decided to do again
   */
  async updateTasksForGoal(goalUid: string): Promise<void> {
    const goal = await this.goalRepo.getById(goalUid);
    if (!goal) return;

    // Skip goals marked as doNotPractice
    if (goal.doNotPractice) return;

    // Check if we already have active tasks for this goal
    const hasActiveTasks = await this.checkActiveTasksForGoal(goal);
    if (hasActiveTasks) {
      return; // No need to create new tasks
    }

    // Generate appropriate tasks based on goal state
    const newTasks = await this.generateTasksForGoal(goal);
    
    // Save new tasks and update goal.tasks array
    const taskUids: string[] = [];
    
    for (const taskData of newTasks) {
      await this.taskRepo.saveTask(toRaw(taskData));
      taskUids.push(taskData.uid);
    }
    
    // Update goal with new task references
    const updatedGoal: GoalData = {
      ...goal,
      tasks: [...goal.tasks, ...taskUids]
    };
    
    await this.goalRepo.update(goal.uid, updatedGoal);
  }

  /**
   * Check if goal already has active tasks
   */
  private async checkActiveTasksForGoal(goal: GoalData): Promise<boolean> {
    if (goal.tasks.length === 0) return false;

    // Get existing tasks for this goal
    const existingTasks = await this.taskRepo.getTasksByGoalId(goal.uid);
    const activeTasks = existingTasks.filter(task => task.isActive);
    
    return activeTasks.length > 0;
  }

  /**
   * Generate tasks based on goal state
   */
  private async generateTasksForGoal(goal: GoalData): Promise<TaskData[]> {
    const tasks: TaskData[] = [];
    const baseUid = `goal-task-${goal.uid}-${Date.now()}`;

    // Create task for adding vocabulary if goal has few vocab items
    if (goal.vocab.length < 10) { // Arbitrary threshold - could be configurable
      tasks.push(this.createAddVocabTask(baseUid + '-add-vocab', goal));
    }

    // Create task for adding sub-goals if goal has no sub-goals
    if (goal.subGoals.length === 0) {
      tasks.push(this.createAddSubGoalsTask(baseUid + '-add-subgoals', goal));
    }

    return tasks;
  }

  private createAddVocabTask(uid: string, goal: GoalData): TaskData {
    return {
      uid,
      taskType: 'goal-add-vocab',
      title: `Add vocabulary to "${goal.title}"`,
      prompt: `Add more vocabulary to help achieve this goal: ${goal.title}`,
      evaluateDifficultyAfterDoing: false,
      decideWhetherToDoAgainAfterDoing: true,
      isOneTime: false,
      isActive: true,
      taskSize: 'medium',
      associatedGoals: [goal.uid]
    };
  }

  private createAddSubGoalsTask(uid: string, goal: GoalData): TaskData {
    return {
      uid,
      taskType: 'goal-add-sub-goals',
      title: `Add sub-goals to "${goal.title}"`,
      prompt: `Break down this goal into smaller, achievable sub-goals: ${goal.title}`,
      evaluateDifficultyAfterDoing: false,
      decideWhetherToDoAgainAfterDoing: true,
      isOneTime: false,
      isActive: true,
      taskSize: 'medium',
      associatedGoals: [goal.uid]
    };
  }

  /**
   * Update tasks for multiple goals (batch operation)
   */
  async updateTasksForMultipleGoals(goalUids: string[]): Promise<void> {
    for (const uid of goalUids) {
      await this.updateTasksForGoal(uid);
    }
  }
}