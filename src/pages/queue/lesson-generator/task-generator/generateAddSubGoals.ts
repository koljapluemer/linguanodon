import type { GoalData } from '@/entities/goals/GoalData';
import type { Task } from '@/entities/tasks/Task';

export function generateAddSubGoals(goal: GoalData): Task {
  const uid = `add-sub-goals-${goal.uid}-${Date.now()}`;
  
  return {
    uid,
    language: goal.language,
    taskType: 'add-sub-goals',
    prompt: `Break down this goal into smaller, achievable sub-goals.`,
    associatedGoals: [goal.uid]
  };
}

export function canGenerateAddSubGoals(goal: GoalData): boolean {
  // Can generate if goal hasn't finished adding sub-goals OR if goal has no sub-goals
  return !goal.finishedAddingSubGoals || goal.subGoals.length === 0;
}