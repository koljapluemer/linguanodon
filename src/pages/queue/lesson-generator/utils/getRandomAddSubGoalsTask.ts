import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { TaskData } from '@/entities/tasks/Task';
import { generateAddSubGoals, canGenerateAddSubGoals } from '../task-generator/generateAddSubGoals';

export async function getRandomAddSubGoalsTask(
  goalRepo: GoalRepoContract,
  languageCodes: string[]
): Promise<TaskData | null> {
  try {
    // Get incomplete goals (more efficient than all goals)
    const goals = await goalRepo.getIncompleteGoals();
    const filteredGoals = goals.filter(goal => languageCodes.includes(goal.language));
    
    if (filteredGoals.length === 0) return null;
    
    // Shuffle and try to find a valid goal
    const shuffled = [...filteredGoals].sort(() => Math.random() - 0.5);
    
    for (const goal of shuffled) {
      if (canGenerateAddSubGoals(goal)) {
        return generateAddSubGoals(goal);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating add sub goals task:', error);
    return null;
  }
}