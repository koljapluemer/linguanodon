import type { TaskProposerContract } from '../TaskProposerContract';
import type { Task } from '@/entities/tasks/Task';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

export class ProposeAddExamplesToGoal implements TaskProposerContract {
  constructor(private goalRepo?: GoalRepoContract) {}

  async proposeTask(): Promise<Task | null> {
    if (!this.goalRepo) {
      console.warn('GoalRepo not available for ProposeAddExamplesToGoal');
      return null;
    }

    try {
      // Find incomplete goals that need examples
      const incompleteGoals = await this.goalRepo.getIncompleteGoals();
      
      for (const goal of incompleteGoals) {
        const coreTask = goal.coreTasks.find(t => t.taskType === 'add-examples-to-goal');
        
        // If this goal has the add-examples-to-goal task and it's not marked as complete
        if (coreTask && coreTask.isActive !== false) {
          return {
            uid: crypto.randomUUID(),
            taskType: 'add-examples-to-goal',
            title: `Add examples to "${goal.title}"`,
            prompt: `Add relevant example sentences to the goal "${goal.title}".`,
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
      console.error('Error proposing add examples to goal task:', error);
      return null;
    }
  }

  setGoalRepo(repo: GoalRepoContract) {
    this.goalRepo = repo;
  }
}