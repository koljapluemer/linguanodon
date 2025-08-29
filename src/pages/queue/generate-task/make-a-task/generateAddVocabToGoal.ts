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