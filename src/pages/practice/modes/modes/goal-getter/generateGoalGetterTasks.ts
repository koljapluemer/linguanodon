import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { Task } from '@/pages/practice/Task';
import { generateAddVocabToGoal } from '@/pages/practice/tasks/task-goal-add-vocab/generate';
import { generateAddSubGoals } from '@/pages/practice/tasks/task-goal-add-sub-goals/generate';
import { randomFromArray } from '@/shared/utils/arrayUtils';

// Define goal task generators using repo-level filtering
const goalTaskGenerators = [
  {
    name: 'add-vocab-to-goal',
    generator: generateAddVocabToGoal,
    getGoals: (goalRepo: GoalRepoContract, languageCodes: string[]) => 
      goalRepo.getGoalsNeedingVocab(languageCodes)
  },
  {
    name: 'add-sub-goals',
    generator: generateAddSubGoals,
    getGoals: (goalRepo: GoalRepoContract, languageCodes: string[]) => 
      goalRepo.getGoalsNeedingSubGoals(languageCodes)
  }
];

export async function generateGoalTask(
  goalRepo: GoalRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Shuffle the goal task generators for random cycling
    const shuffledGenerators = [...goalTaskGenerators].sort(() => Math.random() - 0.5);
    
    // Try each task type until we find one that works
    for (const taskType of shuffledGenerators) {
      try {
        // Get filtered goals for this task type
        const goals = await taskType.getGoals(goalRepo, languageCodes);
        
        if (goals.length > 0) {
          // Get a random goal and generate the task
          const randomGoal = randomFromArray(goals);
          if (randomGoal) {
            const task = taskType.generator(randomGoal);
            return task;
          }
        }
      } catch (error) {
        console.error(`Error generating ${taskType.name} task:`, error);
        // Continue to next task type
      }
    }

    // If we get here, no task types worked
    return null;
  } catch (error) {
    console.error('Error generating goal task:', error);
    return null;
  }
}