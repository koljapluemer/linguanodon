import { reactive } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import { VocabPicker } from './propose-which-vocab-to-practice/VocabPicker';
import { TaskPicker } from './propose-which-task-to-do/TaskPicker';

interface PreloadConfig {
  minVocabBuffer: number;
  minTaskBuffer: number;
  aggressiveThreshold: number;
}

interface PreloadedContent {
  vocabBatches: VocabData[][];
  tasks: RuntimeTask[];
}

interface PreloadStatus {
  vocabBatchesReady: number;
  tasksReady: number;
  isLoadingVocab: boolean;
  isLoadingTask: boolean;
  lastError: string | null;
}

const DEFAULT_CONFIG: PreloadConfig = {
  minVocabBuffer: 2,
  minTaskBuffer: 2,
  aggressiveThreshold: 1
};

export function useQueuePreloader(
  vocabRepo: VocabAndTranslationRepoContract,
  immersionRepo: ImmersionContentRepoContract,
  exampleRepo: ExampleRepoContract,
  goalRepo: GoalRepoContract,
  resourceRepo: ResourceRepoContract,
  config: Partial<PreloadConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Initialize pickers
  const vocabPicker = new VocabPicker();
  vocabPicker.initializeProposers(vocabRepo, immersionRepo, exampleRepo, goalRepo);
  
  const taskPicker = new TaskPicker();
  taskPicker.initializeProposers(vocabRepo, immersionRepo, exampleRepo, goalRepo, resourceRepo);

  // Preloaded content buffers
  const content = reactive<PreloadedContent>({
    vocabBatches: [],
    tasks: []
  });

  // Status tracking
  const status = reactive<PreloadStatus>({
    vocabBatchesReady: 0,
    tasksReady: 0,
    isLoadingVocab: false,
    isLoadingTask: false,
    lastError: null
  });

  // Active loading promises to prevent duplicates
  let vocabLoadingPromise: Promise<void> | null = null;
  let taskLoadingPromise: Promise<void> | null = null;

  // Background vocab batch loading
  async function loadVocabBatch() {
    if (status.isLoadingVocab || vocabLoadingPromise) return;
    
    status.isLoadingVocab = true;
    status.lastError = null;
    
    try {
      vocabLoadingPromise = (async () => {
        const batch = await vocabPicker.pickVocabBatch();
        content.vocabBatches.push(batch);
        status.vocabBatchesReady = content.vocabBatches.length;
      })();
      
      await vocabLoadingPromise;
    } catch (error) {
      console.error('Preloader: Error loading vocab batch:', error);
      status.lastError = 'Failed to load vocabulary';
    } finally {
      status.isLoadingVocab = false;
      vocabLoadingPromise = null;
      
      // Check if we need more
      if (content.vocabBatches.length < finalConfig.minVocabBuffer) {
        setTimeout(() => loadVocabBatch(), 100); // Brief delay to prevent spam
      }
    }
  }

  // Track consecutive failed task loads to prevent infinite loops
  let consecutiveFailedTaskLoads = 0;
  const MAX_CONSECUTIVE_FAILED_LOADS = 3;

  // Background task loading
  async function loadTask() {
    if (status.isLoadingTask || taskLoadingPromise) return;
    
    status.isLoadingTask = true;
    status.lastError = null;
    
    try {
      taskLoadingPromise = (async () => {
        const task = await taskPicker.pickTask();
        if (task) {
          content.tasks.push(task);
          status.tasksReady = content.tasks.length;
          consecutiveFailedTaskLoads = 0; // Reset counter on success
        } else {
          consecutiveFailedTaskLoads++;
        }
      })();
      
      await taskLoadingPromise;
    } catch (error) {
      console.error('Preloader: Error loading task:', error);
      status.lastError = 'Failed to load task';
      consecutiveFailedTaskLoads++;
    } finally {
      status.isLoadingTask = false;
      taskLoadingPromise = null;
      
      // Only continue loading if we haven't failed too many times
      if (content.tasks.length < finalConfig.minTaskBuffer && consecutiveFailedTaskLoads < MAX_CONSECUTIVE_FAILED_LOADS) {
        setTimeout(() => loadTask(), 100); // Brief delay to prevent spam
      } else if (consecutiveFailedTaskLoads >= MAX_CONSECUTIVE_FAILED_LOADS) {
        console.warn('Too many consecutive failed task loads, stopping task preloading');
      }
    }
  }

  // Initialize preloading
  async function initialize() {
    
    // Load initial content in parallel
    const promises = [];
    
    // Load minimum vocab batches
    for (let i = 0; i < finalConfig.minVocabBuffer; i++) {
      promises.push(loadVocabBatch());
    }
    
    // Load minimum tasks
    for (let i = 0; i < finalConfig.minTaskBuffer; i++) {
      promises.push(loadTask());
    }
    
    await Promise.all(promises);
  }

  // Consume methods (instant)
  function consumeNextVocabBatch(): VocabData[] | null {
    const batch = content.vocabBatches.shift() || null;
    if (batch) {
      status.vocabBatchesReady = content.vocabBatches.length;
      
      // Trigger background reload if buffer is low
      if (content.vocabBatches.length <= finalConfig.aggressiveThreshold) {
        loadVocabBatch();
      }
    }
    return batch;
  }

  function consumeNextTask(): RuntimeTask | null {
    const task = content.tasks.shift() || null;
    if (task) {
      status.tasksReady = content.tasks.length;
      
      // Reset failed loads counter when successfully consuming tasks
      consecutiveFailedTaskLoads = 0;
      
      // Trigger background reload if buffer is low
      if (content.tasks.length <= finalConfig.aggressiveThreshold) {
        loadTask();
      }
    }
    return task;
  }

  // Force loading (for fallback scenarios)
  async function forceLoadNextVocabBatch(): Promise<VocabData[]> {
    const batch = await vocabPicker.pickVocabBatch();
    return batch;
  }

  async function forceLoadNextTask(): Promise<RuntimeTask | null> {
    const task = await taskPicker.pickTask();
    return task;
  }

  // Status checks
  const hasVocabReady = () => content.vocabBatches.length > 0;
  const hasTaskReady = () => content.tasks.length > 0;
  const isHealthy = () => !status.lastError && 
    content.vocabBatches.length >= finalConfig.aggressiveThreshold &&
    content.tasks.length >= finalConfig.aggressiveThreshold;

  return {
    // Initialize
    initialize,
    
    // Consume (instant)
    consumeNextVocabBatch,
    consumeNextTask,
    
    // Force load (async fallback)
    forceLoadNextVocabBatch,
    forceLoadNextTask,
    
    // Status
    hasVocabReady,
    hasTaskReady,
    isHealthy,
    status: status,
    
    // Debug
    content,
    config: finalConfig
  };
}