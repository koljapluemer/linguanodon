import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateAddVocabToGoal } from '@/pages/practice/tasks/task-goal-add-vocab/generateAddVocabToGoal';
import { generateAddSubGoals } from '@/pages/practice/tasks/task-goal-add-sub-goals/generateAddSubGoals';
import { randomFromArray } from '@/shared/utils/arrayUtils';

// Define goal task generators
const goalTaskGenerators = [
  {
    name: 'add-vocab-to-goal',
    generator: generateAddVocabToGoal
  },
  {
    name: 'add-sub-goals',
    generator: generateAddSubGoals
  }
];

export async function generateGoalTask(
  goalRepo: GoalRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Get incomplete goals filtered by language
    const goals = await goalRepo.getIncompleteGoals();
    const filteredGoals = goals.filter(goal => languageCodes.includes(goal.language));
    
    if (filteredGoals.length === 0) {
      return null;
    }

    // Shuffle the goal task generators for random cycling
    const shuffledGenerators = [...goalTaskGenerators].sort(() => Math.random() - 0.5);
    
    // Try each task type until we find one that works
    for (const taskType of shuffledGenerators) {
      // Get a random goal for this task type
      const randomGoal = randomFromArray(filteredGoals);
      if (randomGoal) {
        try {
          // Generate the task
          const task = taskType.generator(randomGoal);
          return task;
        } catch (error) {
          console.error(`Error generating ${taskType.name} task:`, error);
          // Continue to next task type
        }
      }
    }

    // If we get here, no task types worked
    return null;
  } catch (error) {
    console.error('Error generating goal task:', error);
    return null;
  }
}