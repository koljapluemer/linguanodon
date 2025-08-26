import type { Task, TaskName } from '@/entities/tasks/Task';
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
import { getRandomClozeChoiceTask } from './utils/getRandomClozeChoiceTask';
import { getRandomClozeRevealTask } from './utils/getRandomClozeRevealTask';
import { getRandomAddTranslationTask } from './utils/getRandomAddTranslationTask';
import { getRandomVocabFormSentenceTask } from './utils/getRandomVocabFormSentenceTask';
import { useTaskSizeTracker } from './utils/useTaskSizeTracker';
import { usePronunciationTaskTracker } from './utils/usePronunciationTaskTracker';
import { useNewVocabTracker } from './utils/useNewVocabTracker';

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
    const { getPreferredTaskSize, getTasksOfSize, trackTask } = useTaskSizeTracker();
    const { canGeneratePronunciationTask, trackTask: trackPronunciationTask } = usePronunciationTaskTracker();
    const { canGenerateNewVocabTask, trackTask: trackNewVocabTask, isNewVocabTask } = useNewVocabTracker();
    
    // Define all available task generators with their task names
    const baseGenerators: Array<{ generator: TaskGenerator; taskName: TaskName }> = [
      { generator: () => getRandomAddPronunciationTask(vocabRepo, translationRepo, noteRepo, languageCodes), taskName: 'add-pronunciation' },
      { generator: () => getRandomAddTranslationTask(vocabRepo, translationRepo, languageCodes), taskName: 'add-translation' },
      { generator: () => getRandomExtractKnowledgeTask(resourceRepo, languageCodes), taskName: 'extract-knowledge-from-resource' },
      { generator: () => getRandomAddSubGoalsTask(goalRepo, languageCodes), taskName: 'add-sub-goals' },
      { generator: () => getRandomAddVocabToGoalTask(goalRepo, languageCodes), taskName: 'add-vocab-to-goal' },
      { generator: () => getRandomVocabTryToRememberTask(vocabRepo, languageCodes), taskName: 'vocab-try-to-remember' },
      { generator: () => getRandomVocabRevealTask(vocabRepo, translationRepo, languageCodes), taskName: 'vocab-reveal-target-to-native' },
      { generator: () => getRandomVocabChoiceTask(vocabRepo, translationRepo, languageCodes), taskName: 'vocab-choose-from-two-target-to-native' },
      { generator: () => getRandomClozeChoiceTask(vocabRepo, translationRepo, languageCodes), taskName: 'cloze-choose-from-two' },
      { generator: () => getRandomClozeRevealTask(vocabRepo, translationRepo, languageCodes), taskName: 'cloze-reveal' },
      { generator: () => getRandomVocabFormSentenceTask(vocabRepo, translationRepo, languageCodes), taskName: 'vocab-form-sentence' }
    ];
    
    // Filter out tasks based on limits
    let allGenerators = baseGenerators;
    
    // Filter out add-pronunciation if it's been picked too many times recently
    if (!canGeneratePronunciationTask()) {
      allGenerators = allGenerators.filter(g => g.taskName !== 'add-pronunciation');
    }
    
    // Filter out new vocab tasks if limits exceeded
    if (!canGenerateNewVocabTask()) {
      allGenerators = allGenerators.filter(g => !isNewVocabTask(g.taskName));
    }
    
    // Get preferred task size based on recent distribution
    const preferredSize = getPreferredTaskSize();
    const preferredTaskNames = getTasksOfSize(preferredSize);
    
    // Filter generators for preferred size
    const preferredGenerators = allGenerators.filter(g => 
      preferredTaskNames.includes(g.taskName)
    );
    
    // Try preferred size generators first
    if (preferredGenerators.length > 0) {
      const shuffledPreferred = [...preferredGenerators].sort(() => Math.random() - 0.5);
      
      for (const { generator, taskName } of shuffledPreferred) {
        try {
          const task = await generator();
          if (task) {
            console.log(`[TaskGenerator] Generated preferred task: ${task.taskType} (${preferredSize})`);
            trackTask(taskName);
            trackPronunciationTask(taskName);
            trackNewVocabTask(taskName);
            return task;
          }
        } catch (error) {
          console.error(`[TaskGenerator] Error with preferred task generator:`, error);
          // Continue to next generator
        }
      }
    }
    
    // Fallback: try all generators in random order
    const shuffledGenerators = [...allGenerators].sort(() => Math.random() - 0.5);
    
    for (const { generator, taskName } of shuffledGenerators) {
      try {
        const task = await generator();
        if (task) {
          console.log(`[TaskGenerator] Generated fallback task: ${task.taskType}`);
          trackTask(taskName);
          trackPronunciationTask(taskName);
          trackNewVocabTask(taskName);
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