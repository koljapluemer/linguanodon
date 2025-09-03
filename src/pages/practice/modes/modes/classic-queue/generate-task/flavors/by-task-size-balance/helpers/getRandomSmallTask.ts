import type { Task } from '@/entities/tasks/Task';
import type { TaskGeneratorContext } from '../../../types/TaskGeneratorContext';
import { getRandomVocabTryToRememberTask } from '../../../../../../../tasks/task-vocab-try-to-remember/getRandom';
import { getRandomVocabRevealTask } from '../../../../../../../tasks/task-vocab-reveal/getRandom';
import { getRandomVocabChoiceTask } from '../../../../../../../tasks/task-vocab-single-choice/getRandom';
import { getRandomClozeChoiceTask } from '../../../../../../../tasks/task-cloze-choice/getRandom';
import { getRandomClozeRevealTask } from '../../../../../../../tasks/task-cloze-reveal/getRandom';
import { getRandomFactCardTryToRememberTask } from '../../../../../../../tasks/task-fact-card-try-to-remember/getRandom';
import { getRandomFactCardRevealTask } from '../../../../../../../tasks/task-fact-card-reveal/getRandom';
import { shuffleArray } from '@/shared/utils/arrayUtils';

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