import type { Task, TaskName } from '@/entities/tasks/Task';
import { useTaskTypeTracker } from './useTaskTypeTracker';

type TaskGenerator = () => Promise<Task | null>;

interface TaskGeneratorInfo {
  generator: TaskGenerator;
  taskName: TaskName;
}

export async function chooseRareTask(
  allGenerators: TaskGeneratorInfo[]
): Promise<{ task: Task; taskName: TaskName } | null> {
  const { recommendRareTask } = useTaskTypeTracker();
  
  // Get all available task names
  const availableTaskNames = allGenerators.map(g => g.taskName);
  
  // Get recommended rare task
  const rareTaskName = recommendRareTask(availableTaskNames);
  
  if (rareTaskName) {
    // Try to generate the recommended rare task
    const rareGenerator = allGenerators.find(g => g.taskName === rareTaskName);
    
    if (rareGenerator) {
      try {
        const task = await rareGenerator.generator();
        if (task) {
          return { task, taskName: rareTaskName };
        }
      } catch (error) {
        console.error(`[TaskGenerator] Error with rare task generator ${rareTaskName}:`, error);
      }
    }
  }
  
  // Fallback: try all generators in random order until one succeeds
  const shuffledGenerators = [...allGenerators].sort(() => Math.random() - 0.5);
  
  for (const { generator, taskName } of shuffledGenerators) {
    try {
      const task = await generator();
      if (task) {
        return { task, taskName };
      }
    } catch (error) {
      console.error(`[TaskGenerator] Error with fallback task generator ${taskName}:`, error);
      // Continue to next generator
    }
  }
  
  return null;
}