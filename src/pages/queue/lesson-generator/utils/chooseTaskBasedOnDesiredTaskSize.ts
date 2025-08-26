import type { Task, TaskName } from '@/entities/tasks/Task';
import { useTaskSizeTracker } from './useTaskSizeTracker';

type TaskGenerator = () => Promise<Task | null>;

interface TaskGeneratorInfo {
  generator: TaskGenerator;
  taskName: TaskName;
}

export async function chooseTaskBasedOnDesiredTaskSize(
  allGenerators: TaskGeneratorInfo[]
): Promise<{ task: Task; taskName: TaskName; isPreferred: boolean } | null> {
  const { getPreferredTaskSize, getTasksOfSize } = useTaskSizeTracker();
  
  // Get preferred task size based on recent distribution
  const preferredSize = getPreferredTaskSize();
  const preferredTaskNames = getTasksOfSize(preferredSize);
  
  // Filter generators for preferred size
  const preferredGenerators = allGenerators.filter(g => 
    preferredTaskNames.includes(g.taskName)
  );
  
  // Try preferred size generators first
  if (preferredGenerators.length > 0) {
    const shuffledPreferred = [...preferredGenerators].sort(() => Math.random() - 0.5);
    
    for (const { generator, taskName } of shuffledPreferred) {
      try {
        const task = await generator();
        if (task) {
          return { task, taskName, isPreferred: true };
        }
      } catch (error) {
        console.error(`[TaskGenerator] Error with preferred task generator:`, error);
        // Continue to next generator
      }
    }
  }
  
  // Fallback: try all generators in random order
  const shuffledGenerators = [...allGenerators].sort(() => Math.random() - 0.5);
  
  for (const { generator, taskName } of shuffledGenerators) {
    try {
      const task = await generator();
      if (task) {
        return { task, taskName, isPreferred: false };
      }
    } catch (error) {
      console.error(`[TaskGenerator] Error with task generator:`, error);
      // Continue to next generator
    }
  }
  
  return null;
}