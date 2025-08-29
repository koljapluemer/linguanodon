import type { Task } from '@/entities/tasks/Task';
import type { TaskGeneratorContext } from '../../../types/TaskGeneratorContext';
import { getRandomAddPronunciationTask } from '../../by-task-type-balance/helpers/getRandomAddPronunciationTask';
import { getRandomExtractKnowledgeTask } from '../../by-task-type-balance/helpers/getRandomExtractKnowledgeTask';
import { shuffleArray } from '@/shared/arrayUtils';

type BigTaskGenerator = () => Promise<Task | null>;

export async function getRandomBigTask(
  context: TaskGeneratorContext
): Promise<Task | null> {
  const { vocabRepo, translationRepo, resourceRepo, noteRepo, languageCodes, vocabBlockList } = context;
  
  const bigTaskGenerators: BigTaskGenerator[] = [
    () => getRandomAddPronunciationTask(vocabRepo, translationRepo, noteRepo, languageCodes, vocabBlockList),
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