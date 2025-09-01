import type { Task, TaskName } from '@/entities/tasks/Task';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { TaskGeneratorContext } from './types/TaskGeneratorContext';
import { getRandomExtractKnowledgeTask } from './flavors/by-task-type-balance/helpers/getRandomExtractKnowledgeTask';
import { getRandomAddSubGoalsTask } from './flavors/by-task-type-balance/helpers/getRandomAddSubGoalsTask';
import { getRandomAddVocabToGoalTask } from './flavors/by-task-type-balance/helpers/getRandomAddVocabToGoalTask';
import { getRandomVocabTryToRememberTask } from './flavors/by-task-type-balance/helpers/getRandomVocabTryToRememberTask';
import { getRandomVocabRevealTask } from './flavors/by-task-type-balance/helpers/getRandomVocabRevealTask';
import { getRandomVocabChoiceTask } from './flavors/by-task-type-balance/helpers/getRandomVocabChoiceTask';
import { getRandomClozeChoiceTask } from './flavors/by-task-type-balance/helpers/getRandomClozeChoiceTask';
import { getRandomClozeRevealTask } from './flavors/by-task-type-balance/helpers/getRandomClozeRevealTask';
import { getRandomAddTranslationTask } from './flavors/by-task-type-balance/helpers/getRandomAddTranslationTask';
import { getRandomVocabFormSentenceTask } from './flavors/by-task-type-balance/helpers/getRandomVocabFormSentenceTask';
import { useTaskSizeTracker } from './trackers/useTaskSizeTracker';
import { useTaskTypeTracker } from './trackers/useTaskTypeTracker';
import { useNewVocabTracker } from './trackers/useNewVocabTracker';
import { useTrackTaskNumber } from './trackers/useTrackTaskNumber';
import { makeTaskWithFocusOnVocab } from './flavors/by-focused-vocab/makeTaskWithFocusOnVocab';
import { chooseTaskBasedOnDesiredTaskSize } from './flavors/by-task-size-balance/chooseTaskBasedOnUnderusedTaskSize';
import { chooseRareTask } from './flavors/by-task-type-balance/chooseRareTask';
import { getBackupTask } from './flavors/backup/getBackupTask';
import { useTrackUsedVocab } from './trackers/useTrackUsedVocab';
import { pickWeightedRandom } from '@/shared/arrayUtils';

type TaskGenerator = () => Promise<Task | null>;

export async function makeTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  resourceRepo: ResourceRepoContract,
  languageRepo: LanguageRepoContract,
  goalRepo: GoalRepoContract,
  noteRepo: NoteRepoContract,
  focusOnVocab?: string
): Promise<Task | null> {
  try {
    // Get all active target languages
    const activeLanguages = await languageRepo.getActiveTargetLanguages();
    
    if (activeLanguages.length === 0) {
      console.warn('No active target languages found');
      return null;
    }
    
    const languageCodes = activeLanguages.map(lang => lang.code);
    const { trackTask } = useTaskSizeTracker();
    const { trackTask: trackTaskType } = useTaskTypeTracker();
    const { canGenerateNewVocabTask, trackTask: trackNewVocabTask, isNewVocabTask } = useNewVocabTracker();
    const { incrementTaskCount } = useTrackTaskNumber();
    const { getRecentlyUsedVocab, trackVocabUsed } = useTrackUsedVocab();
    
    // Get recently used vocab to exclude from selection
    const vocabBlockList = getRecentlyUsedVocab();
    
    // Check if we should use focused vocab task generation
    if (focusOnVocab && Math.random() < 0.8) { // 80% chance to use focused vocab
      const focusedTask = await makeTaskWithFocusOnVocab(
        focusOnVocab,
        vocabRepo,
        translationRepo,
        vocabBlockList
      );
      
      if (focusedTask) {
        incrementTaskCount();
        trackTask(focusedTask.taskType as TaskName);
        trackTaskType(focusedTask.taskType as TaskName);
        trackNewVocabTask(focusedTask.taskType as TaskName);
        
        // Track vocab used in this focused task
        if (focusedTask.associatedVocab && focusedTask.associatedVocab.length > 0) {
          trackVocabUsed(focusedTask.associatedVocab);
        }
        
        console.log(`[TaskGenerator] Generated focused task: ${focusedTask.taskType}`);
        return focusedTask;
      }
      // If focused task generation fails, fall back to standard generation
    }
    
    // Define all available task generators with their task names
    const baseGenerators: Array<{ generator: TaskGenerator; taskName: TaskName }> = [
      { generator: () => getRandomAddTranslationTask(vocabRepo, translationRepo, languageCodes, vocabBlockList), taskName: 'add-translation' },
      { generator: () => getRandomExtractKnowledgeTask(resourceRepo, languageCodes), taskName: 'extract-knowledge-from-resource' },
      { generator: () => getRandomAddSubGoalsTask(goalRepo, languageCodes), taskName: 'add-sub-goals' },
      { generator: () => getRandomAddVocabToGoalTask(goalRepo, languageCodes), taskName: 'add-vocab-to-goal' },
      { generator: () => getRandomVocabTryToRememberTask(vocabRepo, resourceRepo, languageCodes, vocabBlockList), taskName: 'vocab-try-to-remember' },
      { generator: () => getRandomVocabRevealTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList), taskName: 'vocab-reveal-target-to-native' },
      { generator: () => getRandomVocabChoiceTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList), taskName: 'vocab-choose-from-two-target-to-native' },
      { generator: () => getRandomClozeChoiceTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList), taskName: 'cloze-choose-from-two' },
      { generator: () => getRandomClozeRevealTask(vocabRepo, resourceRepo, translationRepo, languageCodes, vocabBlockList), taskName: 'cloze-reveal' },
      { generator: () => getRandomVocabFormSentenceTask(vocabRepo, translationRepo, languageCodes, vocabBlockList), taskName: 'vocab-form-sentence' }
    ];
    
    // Filter out tasks based on limits
    let allGenerators = baseGenerators;
    
    // Filter out new vocab tasks if limits exceeded
    if (!canGenerateNewVocabTask()) {
      allGenerators = allGenerators.filter(g => !isNewVocabTask(g.taskName));
    }
    
    // Choose task selection method: 2/3 weighted by size, 1/3 rare task picker
    const selectionMethods = ['weighted-size', 'rare-task'];
    const selectionWeights = [2, 1];
    const selectedMethod = pickWeightedRandom(selectionMethods, selectionWeights);
    
    let result: { task: Task; taskName: TaskName; isPreferred?: boolean } | null = null;
    
    if (selectedMethod === 'weighted-size') {
      const context: TaskGeneratorContext = {
        vocabRepo,
        translationRepo,
        resourceRepo,
        languageRepo,
        goalRepo,
        noteRepo,
        languageCodes,
        vocabBlockList
      };
      result = await chooseTaskBasedOnDesiredTaskSize(context);
    } else {
      const rareResult = await chooseRareTask(allGenerators);
      if (rareResult) {
        result = { ...rareResult, isPreferred: false };
      }
    }
    
    if (result) {
      const { task, taskName, isPreferred } = result;
      const methodUsed = selectedMethod === 'weighted-size' ? 'size-weighted' : 'rare-task';
      const preferenceLabel = isPreferred ? 'preferred' : 'fallback';
      const logMessage = `[TaskGenerator] Generated ${methodUsed} ${preferenceLabel} task: ${task.taskType}`;
      
      console.log(logMessage);
      incrementTaskCount();
      trackTask(taskName);
      trackTaskType(taskName);
      trackNewVocabTask(taskName);
      
      // Track vocab used in this task
      if (task.associatedVocab && task.associatedVocab.length > 0) {
        trackVocabUsed(task.associatedVocab);
      }
      
      return task;
    }
    
    // All generators tried and no task generated, try backup task
    console.log('[TaskGenerator] All task generators exhausted, trying backup task');
    const backupTask = await getBackupTask(vocabRepo, translationRepo, languageCodes, vocabBlockList);
    
    if (backupTask) {
      console.log(`[TaskGenerator] Generated backup task: ${backupTask.taskType}`);
      incrementTaskCount();
      trackTask(backupTask.taskType as TaskName);
      trackTaskType(backupTask.taskType as TaskName);
      trackNewVocabTask(backupTask.taskType as TaskName);
      
      // Track vocab used in this backup task
      if (backupTask.associatedVocab && backupTask.associatedVocab.length > 0) {
        trackVocabUsed(backupTask.associatedVocab);
      }
      
      return backupTask;
    }
    
    console.warn('All task generators exhausted, including backup task');
    return null;
    
  } catch (error) {
    console.warn('Error generating task:', error);
    return null;
  }
}