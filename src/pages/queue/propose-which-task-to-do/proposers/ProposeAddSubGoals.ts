import type { TaskProposerContract } from '../TaskProposerContract';
import type { Task } from '@/entities/tasks/Task';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

export class ProposeAddSubGoals implements TaskProposerContract {
  constructor(private goalRepo?: GoalRepoContract) {}

  async proposeTask(): Promise<Task | null> {
    if (!this.goalRepo) {
      console.warn('GoalRepo not available for ProposeAddSubGoals');
      return null;
    }

    try {
      // Find incomplete goals that need sub-goals
      const incompleteGoals = await this.goalRepo.getIncompleteGoals();
      
      for (const goal of incompleteGoals) {
        const coreTask = goal.coreTasks.find(t => t.taskType === 'add-sub-goals');
        
        // If this goal has the add-sub-goals task and it's not marked as complete
        if (coreTask && coreTask.isActive !== false) {
          return {
            uid: crypto.randomUUID(),
            taskType: 'add-sub-goals',
            title: `Add sub-goals to "${goal.title}"`,
            prompt: `Break down the goal "${goal.title}" into smaller, actionable sub-goals.`,
            evaluateCorrectnessAndConfidenceAfterDoing: false,
            decideWhetherToDoAgainAfterDoing: true,
            isActive: true,
            taskSize: 'big',
            associatedUnits: [{ type: 'Goal', uid: goal.uid }],
            mayBeConsideredDone: false,
            isDone: false
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error proposing add sub-goals task:', error);
      return null;
    }
  }

  setGoalRepo(repo: GoalRepoContract) {
    this.goalRepo = repo;
  }
}