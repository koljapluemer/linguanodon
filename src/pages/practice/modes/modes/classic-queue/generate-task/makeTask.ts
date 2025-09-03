import type { Task, TaskName } from '@/entities/tasks/Task';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { TaskGeneratorContext } from './types/TaskGeneratorContext';
import { useTaskSizeTracker } from './trackers/useTaskSizeTracker';
import { useTaskTypeTracker } from './trackers/useTaskTypeTracker';
import { useNewVocabTracker } from './trackers/useNewVocabTracker';
import { useTrackTaskNumber } from './trackers/useTrackTaskNumber';
import { makeTaskWithFocusOnVocab } from './flavors/by-focused-vocab/makeTaskWithFocusOnVocab';
import { chooseTaskBasedOnDesiredTaskSize } from './flavors/by-task-size-balance/chooseTaskBasedOnUnderusedTaskSize';
import { getBackupTask } from './flavors/backup/getBackupTask';
import { useTrackUsedVocab } from './trackers/useTrackUsedVocab';


export async function makeTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  resourceRepo: ResourceRepoContract,
  languageRepo: LanguageRepoContract,
  goalRepo: GoalRepoContract,
  noteRepo: NoteRepoContract,
  factCardRepo: FactCardRepoContract,
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
    const { trackTask: trackNewVocabTask } = useNewVocabTracker();
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
    
    
    // Use size-based task selection
    const context: TaskGeneratorContext = {
      vocabRepo,
      translationRepo,
      resourceRepo,
      languageRepo,
      goalRepo,
      noteRepo,
      factCardRepo,
      languageCodes,
      vocabBlockList
    };
    const result = await chooseTaskBasedOnDesiredTaskSize(context);
    
    if (result) {
      const { task, taskName, isPreferred } = result;
      const methodUsed = 'size-weighted';
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