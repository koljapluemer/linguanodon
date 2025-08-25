import type { Task } from '@/entities/tasks/Task';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import { getRandomAddPronunciationTask } from './utils/getRandomAddPronunciationTask';
import { getRandomExtractKnowledgeTask } from './utils/getRandomExtractKnowledgeTask';
import { getRandomAddSubGoalsTask } from './utils/getRandomAddSubGoalsTask';
import { getRandomAddVocabToGoalTask } from './utils/getRandomAddVocabToGoalTask';
import { getRandomVocabTryToRememberTask } from './utils/getRandomVocabTryToRememberTask';
import { getRandomVocabRevealTask } from './utils/getRandomVocabRevealTask';
import { getRandomVocabChoiceTask } from './utils/getRandomVocabChoiceTask';

type TaskGenerator = () => Promise<Task | null>;

export async function makeTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  resourceRepo: ResourceRepoContract,
  languageRepo: LanguageRepoContract,
  _immersionContentRepo: ImmersionContentRepoContract,
  goalRepo: GoalRepoContract,
  noteRepo: NoteRepoContract
): Promise<Task | null> {
  try {
    // Get all active target languages
    const activeLanguages = await languageRepo.getActiveTargetLanguages();
    
    if (activeLanguages.length === 0) {
      console.warn('No active target languages found');
      return null;
    }
    
    const languageCodes = activeLanguages.map(lang => lang.code);
    
    // Define all available task generators
    const allGenerators: TaskGenerator[] = [
      () => getRandomAddPronunciationTask(vocabRepo, translationRepo, noteRepo, languageCodes),
      () => getRandomExtractKnowledgeTask(resourceRepo, languageCodes),
      () => getRandomAddSubGoalsTask(goalRepo, languageCodes),
      () => getRandomAddVocabToGoalTask(goalRepo, languageCodes),
      () => getRandomVocabTryToRememberTask(vocabRepo, languageCodes),
      () => getRandomVocabRevealTask(vocabRepo, translationRepo, languageCodes),
      () => getRandomVocabChoiceTask(vocabRepo, translationRepo, languageCodes)
    ];
    
    // Shuffle generators to try them in random order
    const shuffledGenerators = [...allGenerators].sort(() => Math.random() - 0.5);
    
    // Try each generator until we get a task or exhaust all options
    for (const generator of shuffledGenerators) {
      try {
        const task = await generator();
        if (task) {
          console.log(`[TaskGenerator] Generated task: ${task.taskType}`);
          return task;
        }
      } catch (error) {
        console.error(`[TaskGenerator] Error with task generator:`, error);
        // Continue to next generator
      }
    }
    
    // All generators tried and no task generated
    console.warn('All task generators exhausted, no task generated');
    return null;
    
  } catch (error) {
    console.warn('Error generating task:', error);
    return null;
  }
}