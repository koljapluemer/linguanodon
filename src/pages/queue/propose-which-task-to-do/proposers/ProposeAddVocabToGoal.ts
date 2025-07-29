import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

export class ProposeAddVocabToGoal implements TaskProposerContract {
  constructor(private goalRepo?: GoalRepoContract) {}

  async proposeTask(): Promise<RuntimeTask | null> {
    if (!this.goalRepo) {
      console.warn('GoalRepo not available for ProposeAddVocabToGoal');
      return null;
    }

    try {
      // Find incomplete goals that need vocabulary
      const incompleteGoals = await this.goalRepo.getIncompleteGoals();
      
      for (const goal of incompleteGoals) {
        const coreTask = goal.coreTasks.find(t => t.taskType === 'add-vocab-to-goal');
        
        // If this goal has the add-vocab-to-goal task and it's not marked as complete
        if (coreTask && coreTask.wantToDoAgain !== false) {
          return {
            taskType: 'add-vocab-to-goal',
            data: { goalId: goal.id, goal }
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error proposing add vocab to goal task:', error);
      return null;
    }
  }

  setGoalRepo(repo: GoalRepoContract) {
    this.goalRepo = repo;
  }
}