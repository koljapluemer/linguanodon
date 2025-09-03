import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/entities/tasks/Task';
import { generateAddSubGoals } from '@/pages/practice/tasks/task-goal-add-sub-goals/generate';

export async function getRandomAddSubGoalsTask({
  goalRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!goalRepo) return null;
  try {
    // Get incomplete goals (more efficient than all goals)
    const goals = await goalRepo.getIncompleteGoals();
    const filteredGoals = goals.filter(goal => languageCodes.includes(goal.language));
    
    if (filteredGoals.length === 0) return null;
    
    // Shuffle and try to find a valid goal
    const shuffled = [...filteredGoals].sort(() => Math.random() - 0.5);
    
    for (const goal of shuffled) {
      return generateAddSubGoals(goal);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating add sub goals task:', error);
    return null;
  }
}