import type { Task } from '@/entities/tasks/Task';
import type { TaskGeneratorContext } from '../../../types/TaskGeneratorContext';
import { getRandomAddTranslationTask } from '../../by-task-type-balance/helpers/getRandomAddTranslationTask';
import { getRandomAddSubGoalsTask } from '../../by-task-type-balance/helpers/getRandomAddSubGoalsTask';
import { getRandomAddVocabToGoalTask } from '../../by-task-type-balance/helpers/getRandomAddVocabToGoalTask';
import { getRandomVocabFormSentenceTask } from '../../by-task-type-balance/helpers/getRandomVocabFormSentenceTask';
import { getRandomGuessWhatSentenceMeansTask } from '../../by-task-type-balance/helpers/getRandomGuessWhatSentenceMeansTask';
import { shuffleArray } from '@/shared/arrayUtils';

type MediumTaskGenerator = () => Promise<Task | null>;

export async function getRandomMediumTask(
  context: TaskGeneratorContext
): Promise<Task | null> {
  const { vocabRepo, translationRepo, goalRepo, languageCodes, vocabBlockList } = context;
  
  const mediumTaskGenerators: MediumTaskGenerator[] = [
    () => getRandomAddTranslationTask(vocabRepo, translationRepo, languageCodes, vocabBlockList),
    () => getRandomAddSubGoalsTask(goalRepo, languageCodes),
    () => getRandomAddVocabToGoalTask(goalRepo, languageCodes),
    () => getRandomVocabFormSentenceTask(vocabRepo, translationRepo, languageCodes, vocabBlockList),
    () => getRandomGuessWhatSentenceMeansTask(vocabRepo, languageCodes, vocabBlockList)
  ];

  // Shuffle and try generators in random order
  const shuffledGenerators = shuffleArray(mediumTaskGenerators);

  for (const generator of shuffledGenerators) {
    try {
      const task = await generator();
      if (task) {
        return task;
      }
    } catch (error) {
      console.error(`[MediumTaskGenerator] Error with task generator:`, error);
      // Continue to next generator
    }
  }

  return null;
}