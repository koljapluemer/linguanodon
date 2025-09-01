import type { Task, TaskName } from '@/entities/tasks/Task';
import type { TaskGeneratorContext } from '../../types/TaskGeneratorContext';
import { useTaskSizeTracker } from '../../trackers/useTaskSizeTracker';
import { getRandomBigTask } from './helpers/getRandomBigTask';
import { getRandomMediumTask } from './helpers/getRandomMediumTask';
import { getRandomSmallTask } from './helpers/getRandomSmallTask';
import { shuffleArray } from '@/shared/arrayUtils';

type TaskSize = 'small' | 'medium' | 'big';

export async function chooseTaskBasedOnDesiredTaskSize(
  context: TaskGeneratorContext
): Promise<{ task: Task; taskName: TaskName; isPreferred: boolean } | null> {
  const { getPreferredTaskSize } = useTaskSizeTracker();
  
  // Get preferred task size based on recent distribution
  const preferredSize = getPreferredTaskSize();
  
  // Try preferred size first
  let task = await tryTaskSize(preferredSize, context);
  if (task) {
    return { task, taskName: task.taskType as TaskName, isPreferred: true };
  }
  
  // Fallback: try other sizes in random order
  const allSizes: TaskSize[] = ['small', 'medium', 'big'];
  const otherSizes = allSizes.filter(size => size !== preferredSize);
  const shuffledOtherSizes = shuffleArray(otherSizes);
  
  for (const size of shuffledOtherSizes) {
    task = await tryTaskSize(size, context);
    if (task) {
      return { task, taskName: task.taskType as TaskName, isPreferred: false };
    }
  }
  
  return null;
}

async function tryTaskSize(
  size: TaskSize,
  context: TaskGeneratorContext
): Promise<Task | null> {
  try {
    switch (size) {
      case 'big':
        return await getRandomBigTask(context);
      case 'medium':
        return await getRandomMediumTask(context);
      case 'small':
        return await getRandomSmallTask(context);
      default:
        return null;
    }
  } catch (error) {
    console.error(`[TaskGenerator] Error with ${size} task generator:`, error);
    return null;
  }
}