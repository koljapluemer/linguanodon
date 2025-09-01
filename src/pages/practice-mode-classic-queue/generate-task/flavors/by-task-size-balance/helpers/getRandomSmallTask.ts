import type { Task } from '@/entities/tasks/Task';
import type { TaskGeneratorContext } from '../../../types/TaskGeneratorContext';
import { getRandomVocabTryToRememberTask } from '../../by-task-type-balance/helpers/getRandomVocabTryToRememberTask';
import { getRandomVocabRevealTask } from '../../by-task-type-balance/helpers/getRandomVocabRevealTask';
import { getRandomVocabChoiceTask } from '../../by-task-type-balance/helpers/getRandomVocabChoiceTask';
import { getRandomClozeChoiceTask } from '../../by-task-type-balance/helpers/getRandomClozeChoiceTask';
import { getRandomClozeRevealTask } from '../../by-task-type-balance/helpers/getRandomClozeRevealTask';
import { getRandomFactCardTryToRememberTask } from '../../by-task-type-balance/helpers/getRandomFactCardTryToRememberTask';
import { getRandomFactCardRevealTask } from '../../by-task-type-balance/helpers/getRandomFactCardRevealTask';
import { shuffleArray } from '@/shared/arrayUtils';

type SmallTaskGenerator = () => Promise<Task | null>;

export async function getRandomSmallTask(
  context: TaskGeneratorContext
): Promise<Task | null> {
  const { vocabRepo, translationRepo, resourceRepo, factCardRepo, languageCodes, vocabBlockList } = context;
  
  const smallTaskGenerators: SmallTaskGenerator[] = [
    () => getRandomVocabTryToRememberTask(vocabRepo, resourceRepo, languageCodes, vocabBlockList),
    () => getRandomVocabRevealTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList),
    () => getRandomVocabChoiceTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList),
    () => getRandomClozeChoiceTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList),
    () => getRandomClozeRevealTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList),
    () => getRandomFactCardTryToRememberTask(factCardRepo, languageCodes, vocabBlockList),
    () => getRandomFactCardRevealTask(factCardRepo, languageCodes, vocabBlockList)
  ];

  // Shuffle and try generators in random order
  const shuffledGenerators = shuffleArray(smallTaskGenerators);

  for (const generator of shuffledGenerators) {
    try {
      const task = await generator();
      if (task) {
        return task;
      }
    } catch (error) {
      console.error(`[SmallTaskGenerator] Error with task generator:`, error);
      // Continue to next generator
    }
  }

  return null;
}