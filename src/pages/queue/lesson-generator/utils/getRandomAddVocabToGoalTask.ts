import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateAddVocabToGoal, canGenerateAddVocabToGoal } from '../task-generator/generateAddVocabToGoal';

export async function getRandomAddVocabToGoalTask(
  goalRepo: GoalRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Get incomplete goals (more efficient than all goals)
    const goals = await goalRepo.getIncompleteGoals();
    const filteredGoals = goals.filter(goal => languageCodes.includes(goal.language));
    
    if (filteredGoals.length === 0) return null;
    
    // Shuffle and try to find a valid goal
    const shuffled = [...filteredGoals].sort(() => Math.random() - 0.5);
    
    for (const goal of shuffled) {
      if (canGenerateAddVocabToGoal(goal)) {
        return generateAddVocabToGoal(goal);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating add vocab to goal task:', error);
    return null;
  }
}