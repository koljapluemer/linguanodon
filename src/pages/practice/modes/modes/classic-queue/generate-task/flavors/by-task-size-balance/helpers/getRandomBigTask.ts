import type { Task } from '@/entities/tasks/Task';
import type { TaskGeneratorContext } from '../../../types/TaskGeneratorContext';
import { getRandomExtractKnowledgeTask } from '../../by-task-type-balance/helpers/getRandomExtractKnowledgeTask';
import { shuffleArray } from '@/shared/utils/arrayUtils';

type BigTaskGenerator = () => Promise<Task | null>;

export async function getRandomBigTask(
  context: TaskGeneratorContext
): Promise<Task | null> {
  const { resourceRepo, languageCodes } = context;
  
  const bigTaskGenerators: BigTaskGenerator[] = [
    () => getRandomExtractKnowledgeTask(resourceRepo, languageCodes)
  ];

  // Shuffle and try generators in random order
  const shuffledGenerators = shuffleArray(bigTaskGenerators);

  for (const generator of shuffledGenerators) {
    try {
      const task = await generator();
      if (task) {
        return task;
      }
    } catch (error) {
      console.error(`[BigTaskGenerator] Error with task generator:`, error);
      // Continue to next generator
    }
  }

  return null;
}