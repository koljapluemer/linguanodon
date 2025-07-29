import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

export class ProposeAddSubGoals implements TaskProposerContract {
  constructor(private goalRepo?: GoalRepoContract) {}

  async proposeTask(): Promise<RuntimeTask | null> {
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
        if (coreTask && coreTask.wantToDoAgain !== false) {
          return {
            taskType: 'add-sub-goals',
            data: { goalId: goal.id, goal }
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