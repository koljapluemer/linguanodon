import type { GoalData } from '@/entities/goals/GoalData';
import type { Task } from '@/entities/tasks/Task';

export function generateAddVocabToGoal(goal: GoalData): Task {
  const uid = `add-vocab-to-goal-${goal.uid}-${Date.now()}`;
  
  return {
    uid,
    language: goal.language,
    taskType: 'add-vocab-to-goal',
    prompt: `Add more vocabulary that helps you achieve this goal.`,
    associatedGoals: [goal.uid]
  };
}

export function canGenerateAddVocabToGoal(goal: GoalData): boolean {
  // Can generate if goal hasn't finished adding knowledge AND hasn't been shown recently
  if (goal.finishedAddingKnowledge) return false;
  
  // Check if shown recently (within 10 minutes)
  if (goal.lastShownAt) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (goal.lastShownAt > tenMinutesAgo) return false;
  }
  
  return true;
}