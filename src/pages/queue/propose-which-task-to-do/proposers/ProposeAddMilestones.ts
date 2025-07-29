import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

export class ProposeAddMilestones implements TaskProposerContract {
  constructor(private goalRepo?: GoalRepoContract) {}

  async proposeTask(): Promise<RuntimeTask | null> {
    if (!this.goalRepo) {
      console.warn('GoalRepo not available for ProposeAddMilestones');
      return null;
    }

    try {
      // Find incomplete goals that need milestones
      const incompleteGoals = await this.goalRepo.getIncompleteGoals();
      
      for (const goal of incompleteGoals) {
        const coreTask = goal.coreTasks.find(t => t.taskType === 'add-milestones');
        
        // If this goal has the add-milestones task and it's not marked as complete
        if (coreTask && coreTask.wantToDoAgain !== false) {
          return {
            taskType: 'add-milestones',
            data: { goalId: goal.id, goal }
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error proposing add milestones task:', error);
      return null;
    }
  }

  setGoalRepo(repo: GoalRepoContract) {
    this.goalRepo = repo;
  }
}