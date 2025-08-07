import type { TaskProposerContract } from '../TaskProposerContract';
import type { Task } from '@/entities/tasks/Task';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

export class ProposeAddMilestones implements TaskProposerContract {
  constructor(private goalRepo?: GoalRepoContract) {}

  async proposeTask(): Promise<Task | null> {
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
            uid: crypto.randomUUID(),
            taskType: 'add-milestones',
            title: `Add milestones to "${goal.title}"`,
            prompt: `Add measurable milestones to track progress for the goal "${goal.title}".`,
            evaluateCorrectnessAndConfidenceAfterDoing: false,
            decideWhetherToDoAgainAfterDoing: true,
            isActive: true,
            taskSize: 'medium',
            associatedUnits: [{ type: 'Goal', uid: goal.uid }],
            mayBeConsideredDone: false,
            isDone: false
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