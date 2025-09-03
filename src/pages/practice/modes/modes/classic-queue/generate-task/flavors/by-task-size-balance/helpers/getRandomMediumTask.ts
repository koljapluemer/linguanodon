import type { Task } from '@/entities/tasks/Task';
import type { TaskGeneratorContext } from '../../../types/TaskGeneratorContext';
import { getRandomAddTranslationTask } from '../../../../../../../tasks/task-vocab-add-translation/getRandom';
import { getRandomAddSubGoalsTask } from '../../../../../../../tasks/task-goal-add-sub-goals/getRandom';
import { getRandomAddVocabToGoalTask } from '../../../../../../../tasks/task-goal-add-vocab/getRandom';
import { getRandomVocabFormSentenceTask } from '../../../../../../../tasks/task-vocab-form-sentence/getRandom.ts';
import { getRandomGuessWhatSentenceMeansTask } from '../../../../../../../tasks/task-guess-what-sentence-means/getRandom';
import { shuffleArray } from '@/shared/utils/arrayUtils';

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