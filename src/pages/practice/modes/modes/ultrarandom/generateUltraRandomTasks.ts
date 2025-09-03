import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { Task } from '@/entities/tasks/Task';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import { shuffleArray } from '@/shared/utils/arrayUtils';

// Import all task generators
import { getRandomVocabTryToRememberTask } from '@/pages/practice/tasks/task-vocab-try-to-remember/getRandom';
import { getRandomVocabRevealTask } from '@/pages/practice/tasks/task-vocab-reveal/getRandom';
import { getRandomVocabChoiceTask } from '@/pages/practice/tasks/task-vocab-single-choice/getRandom';
import { getRandomClozeChoiceTask } from '@/pages/practice/tasks/task-cloze-choice/getRandom';
import { getRandomClozeRevealTask } from '@/pages/practice/tasks/task-cloze-reveal/getRandom';
import { getRandomVocabFormSentenceTask } from '@/pages/practice/tasks/task-vocab-form-sentence/getRandom';
import { getRandomFactCardTryToRememberTask } from '@/pages/practice/tasks/task-fact-card-try-to-remember/getRandom';
import { getRandomFactCardRevealTask } from '@/pages/practice/tasks/task-fact-card-reveal/getRandom';
import { getRandomAddImageToVocabTask } from '@/pages/practice/tasks/task-add-image-to-vocab/getRandom';
import { getRandomVocabChooseImageBySoundTask } from '@/pages/practice/tasks/task-vocab-choose-image-by-sound/getRandom';
import { getRandomAddTranslationTask } from '@/pages/practice/tasks/task-vocab-add-translation/getRandom';
import { getRandomGuessWhatSentenceMeansTask } from '@/pages/practice/tasks/task-guess-what-sentence-means/getRandom';
import { getRandomAddSubGoalsTask } from '@/pages/practice/tasks/task-goal-add-sub-goals/getRandom';
import { getRandomAddVocabToGoalTask } from '@/pages/practice/tasks/task-goal-add-vocab/getRandom';
import { getRandomExtractKnowledgeTask } from '@/pages/practice/tasks/task-resource-extract-knowledge/getRandom';

// Task generator functions mapped by type
const taskGenerators = {
  'vocab-try-to-remember': getRandomVocabTryToRememberTask,
  'vocab-reveal': getRandomVocabRevealTask,
  'vocab-single-choice': getRandomVocabChoiceTask,
  'cloze-choice': getRandomClozeChoiceTask,
  'cloze-reveal': getRandomClozeRevealTask,
  'vocab-form-sentence': getRandomVocabFormSentenceTask,
  'fact-card-try-to-remember': getRandomFactCardTryToRememberTask,
  'fact-card-reveal': getRandomFactCardRevealTask,
  'add-image-to-vocab': getRandomAddImageToVocabTask,
  'vocab-choose-image-by-sound': getRandomVocabChooseImageBySoundTask,
  'vocab-add-translation': getRandomAddTranslationTask,
  'guess-what-sentence-means': getRandomGuessWhatSentenceMeansTask,
  'goal-add-sub-goals': getRandomAddSubGoalsTask,
  'goal-add-vocab': getRandomAddVocabToGoalTask,
  'resource-extract-knowledge': getRandomExtractKnowledgeTask
};

export async function generateUltraRandomTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  factCardRepo: FactCardRepoContract,
  resourceRepo: ResourceRepoContract,
  goalRepo: GoalRepoContract,
  noteRepo: NoteRepoContract,
  languageCodes: string[],
  lastUsedTaskType?: string | null
): Promise<Task | null> {
  try {
    // Create unified context for all generators
    const context: RepositoriesContext & { languageCodes: string[] } = {
      vocabRepo,
      translationRepo,
      factCardRepo,
      resourceRepo,
      goalRepo,
      noteRepo,
      languageCodes
    };

    // Get all available task types
    const allTaskTypes = Object.keys(taskGenerators);
    
    // Filter out last used task type to avoid repetition
    const availableTaskTypes = lastUsedTaskType 
      ? allTaskTypes.filter(type => type !== lastUsedTaskType)
      : allTaskTypes;
    
    // Shuffle the task types for true randomness
    const shuffledTaskTypes = shuffleArray([...availableTaskTypes]);
    
    // Try each task type until one succeeds or we run out
    for (const taskType of shuffledTaskTypes) {
      try {
        const generator = taskGenerators[taskType as keyof typeof taskGenerators];
        if (!generator) continue;
        
        const task = await generator(context);
        
        if (task) {
          return task;
        }
      } catch (error) {
        console.warn(`Failed to generate ${taskType} task:`, error);
        // Continue to next task type
        continue;
      }
    }
    
    // If no task could be generated, return null
    return null;
  } catch (error) {
    console.error('Error generating ultra random task:', error);
    return null;
  }
}