import { reactive } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import { VocabPicker } from './propose-relevant-entities/which-vocab-to-practice/VocabPicker';
import { ResourcePicker } from './propose-relevant-entities/which-resource-to-practice/ResourcePicker';
import { shuffleArray } from '@/shared/arrayUtils';

interface PreloadConfig {
  minTaskBatchBuffer: number;
  aggressiveThreshold: number;
}

interface PreloadedContent {
  taskBatches: TaskData[][];
}

interface PreloadStatus {
  taskBatchesReady: number;
  isLoadingBatch: boolean;
  lastError: string | null;
}

const DEFAULT_CONFIG: PreloadConfig = {
  minTaskBatchBuffer: 2,
  aggressiveThreshold: 1
};

export function useQueuePreloader(
  vocabRepo: VocabAndTranslationRepoContract,
  goalRepo: GoalRepoContract,
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract,
  languageRepo: LanguageRepoContract,
  immersionContentRepo: ImmersionContentRepoContract,
  config: Partial<PreloadConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Initialize pickers
  const vocabPicker = new VocabPicker();
  vocabPicker.initializeProposers(vocabRepo, goalRepo, immersionContentRepo);
  
  const resourcePicker = new ResourcePicker();
  resourcePicker.initializeProposers(resourceRepo, languageRepo, taskRepo);

  // Preloaded content buffers
  const content = reactive<PreloadedContent>({
    taskBatches: []
  });

  // Status tracking
  const status = reactive<PreloadStatus>({
    taskBatchesReady: 0,
    isLoadingBatch: false,
    lastError: null
  });

  // Active loading promise to prevent duplicates
  let batchLoadingPromise: Promise<void> | null = null;

  // TaskData is used directly now, no conversion needed

  // Background task batch loading
  async function loadTaskBatch() {
    if (status.isLoadingBatch || batchLoadingPromise) return;
    
    status.isLoadingBatch = true;
    status.lastError = null;
    
    try {
      batchLoadingPromise = (async () => {
        const batch: TaskData[] = [];
        
        // Step 1: Get 0-2 resource tasks
        const resourceBatch = await resourcePicker.pickResourceBatch();
        for (const resource of resourceBatch) {
          try {
            const resourceTasks = await taskRepo.getTasksByResourceId(resource.uid);
            const activeTasks = resourceTasks.filter(task => task.isActive);
            batch.push(...activeTasks);
          } catch (error) {
            console.error('Error loading tasks for resource:', resource.uid, error);
          }
        }
        
        // Step 1.5: Add 1 goal-based task per batch (as per requirement)
        try {
          const goals = await goalRepo.getAll();
          const eligibleGoals = goals.filter(goal => !goal.doNotPractice);
          
          if (eligibleGoals.length > 0) {
            // Pick a random goal
            const randomGoal = eligibleGoals[Math.floor(Math.random() * eligibleGoals.length)];
            const goalTasks = await taskRepo.getTasksByGoalId(randomGoal.uid);
            const activeGoalTasks = goalTasks.filter(task => task.isActive);
            
            if (activeGoalTasks.length > 0) {
              // Add the first active goal task
              batch.push(activeGoalTasks[0]);
            }
          }
        } catch (error) {
          console.error('Error loading goal tasks:', error);
        }
        
        // Step 2: Fill remaining slots with vocab-based tasks
        const remainingSlots = Math.max(0, 20 - batch.length);
        if (remainingSlots > 0) {
          const vocabBatch = await vocabPicker.pickVocabBatch();
          
          // Get tasks for each vocab entity from TaskRepo
          let vocabTasksAdded = 0;
          for (const vocab of vocabBatch) {
            if (vocabTasksAdded >= remainingSlots) break;
            
            try {
              // Get existing tasks for this vocab from TaskRepo
              const vocabTasks = await taskRepo.getTasksByVocabId(vocab.uid);
              const activeTasks = vocabTasks.filter(task => task.isActive);
              
              // Add up to remaining slots
              for (const task of activeTasks) {
                if (vocabTasksAdded >= remainingSlots) break;
                batch.push(task);
                vocabTasksAdded++;
              }
            } catch (error) {
              console.error('Error loading vocab tasks for:', vocab.uid, error);
            }
          }
        }
        
        // Step 3: Shuffle the final batch
        const shuffledBatch = shuffleArray(batch);
        content.taskBatches.push(shuffledBatch);
        status.taskBatchesReady = content.taskBatches.length;
      })();
      
      await batchLoadingPromise;
    } catch (error) {
      console.error('Preloader: Error loading task batch:', error);
      status.lastError = 'Failed to load task batch';
    } finally {
      status.isLoadingBatch = false;
      batchLoadingPromise = null;
      
      // Check if we need more
      if (content.taskBatches.length < finalConfig.minTaskBatchBuffer) {
        setTimeout(() => loadTaskBatch(), 100); // Brief delay to prevent spam
      }
    }
  }


  // Initialize preloading
  async function initialize() {
    // Load initial task batches
    const promises = [];
    
    // Load minimum task batches
    for (let i = 0; i < finalConfig.minTaskBatchBuffer; i++) {
      promises.push(loadTaskBatch());
    }
    
    await Promise.all(promises);
  }

  // Consume methods (instant)
  function consumeNextTaskBatch(): TaskData[] | null {
    const batch = content.taskBatches.shift() || null;
    if (batch) {
      status.taskBatchesReady = content.taskBatches.length;
      
      // Trigger background reload if buffer is low
      if (content.taskBatches.length <= finalConfig.aggressiveThreshold) {
        loadTaskBatch();
      }
    }
    return batch;
  }

  function consumeNextTask(): TaskData | null {
    // Get next task from the first available batch
    for (let i = 0; i < content.taskBatches.length; i++) {
      const batch = content.taskBatches[i];
      if (batch.length > 0) {
        const task = batch.shift();
        
        // Remove empty batches
        if (batch.length === 0) {
          content.taskBatches.splice(i, 1);
          status.taskBatchesReady = content.taskBatches.length;
          
          // Trigger reload if buffer is low
          if (content.taskBatches.length <= finalConfig.aggressiveThreshold) {
            loadTaskBatch();
          }
        }
        
        return task || null;
      }
    }
    return null;
  }

  // Force loading (for fallback scenarios)
  async function forceLoadNextTaskBatch(): Promise<TaskData[]> {
    const batch: TaskData[] = [];
    
    // Get 0-2 resource tasks
    const resourceBatch = await resourcePicker.pickResourceBatch();
    for (const resource of resourceBatch) {
      try {
        const resourceTasks = await taskRepo.getTasksByResourceId(resource.uid);
        const activeTasks = resourceTasks.filter(task => task.isActive);
        batch.push(...activeTasks);
      } catch (error) {
        console.error('Error loading tasks for resource:', resource.uid, error);
      }
    }
    
    // Fill remaining slots with vocab-based tasks
    const remainingSlots = Math.max(0, 20 - batch.length);
    if (remainingSlots > 0) {
      const vocabBatch = await vocabPicker.pickVocabBatch();
      
      let vocabTasksAdded = 0;
      for (const vocab of vocabBatch) {
        if (vocabTasksAdded >= remainingSlots) break;
        
        try {
          const vocabTasks = await taskRepo.getTasksByVocabId(vocab.uid);
          const activeTasks = vocabTasks.filter(task => task.isActive);
          
          for (const task of activeTasks) {
            if (vocabTasksAdded >= remainingSlots) break;
            batch.push(task);
            vocabTasksAdded++;
          }
        } catch (error) {
          console.error('Error loading vocab tasks for:', vocab.uid, error);
        }
      }
    }
    
    return shuffleArray(batch);
  }

  async function forceLoadNextTask(): Promise<TaskData | null> {
    // Try to get a single task from the batch generator
    const batch = await forceLoadNextTaskBatch();
    return batch.length > 0 ? batch[0] : null;
  }

  // Status checks
  const hasTaskReady = () => {
    return content.taskBatches.length > 0 && content.taskBatches.some(batch => batch.length > 0);
  };
  const isHealthy = () => !status.lastError && 
    content.taskBatches.length >= finalConfig.aggressiveThreshold;

  return {
    // Initialize
    initialize,
    
    // Consume (instant)
    consumeNextTaskBatch,
    consumeNextTask,
    
    // Force load (async fallback)
    forceLoadNextTaskBatch,
    forceLoadNextTask,
    
    // Status
    hasTaskReady,
    isHealthy,
    status: status,
    
    // Debug
    content,
    config: finalConfig
  };
}