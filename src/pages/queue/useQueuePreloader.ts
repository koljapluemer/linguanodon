import { reactive } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
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
  config: Partial<PreloadConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Initialize pickers
  const vocabPicker = new VocabPicker();
  vocabPicker.initializeProposers(vocabRepo, immersionRepo);
  
  const taskPicker = new TaskPicker();
  taskPicker.initializeProposers(vocabRepo, immersionRepo);

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
        console.log('Preloader: Loaded vocab batch, total batches:', status.vocabBatchesReady);
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
          console.log('Preloader: Loaded task, total tasks:', status.tasksReady);
        }
      })();
      
      await taskLoadingPromise;
    } catch (error) {
      console.error('Preloader: Error loading task:', error);
      status.lastError = 'Failed to load task';
    } finally {
      status.isLoadingTask = false;
      taskLoadingPromise = null;
      
      // Check if we need more
      if (content.tasks.length < finalConfig.minTaskBuffer) {
        setTimeout(() => loadTask(), 100); // Brief delay to prevent spam
      }
    }
  }

  // Initialize preloading
  async function initialize() {
    console.log('Preloader: Starting initial preload...');
    
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
    console.log('Preloader: Initial preload complete');
  }

  // Consume methods (instant)
  function consumeNextVocabBatch(): VocabData[] | null {
    const batch = content.vocabBatches.shift() || null;
    if (batch) {
      status.vocabBatchesReady = content.vocabBatches.length;
      console.log('Preloader: Consumed vocab batch, remaining:', status.vocabBatchesReady);
      
      // Trigger background reload if buffer is low
      if (content.vocabBatches.length <= finalConfig.aggressiveThreshold) {
        console.log('Preloader: Vocab buffer low, triggering urgent reload');
        loadVocabBatch();
      }
    }
    return batch;
  }

  function consumeNextTask(): RuntimeTask | null {
    const task = content.tasks.shift() || null;
    if (task) {
      status.tasksReady = content.tasks.length;
      console.log('Preloader: Consumed task, remaining:', status.tasksReady);
      
      // Trigger background reload if buffer is low
      if (content.tasks.length <= finalConfig.aggressiveThreshold) {
        console.log('Preloader: Task buffer low, triggering urgent reload');
        loadTask();
      }
    }
    return task;
  }

  // Force loading (for fallback scenarios)
  async function forceLoadNextVocabBatch(): Promise<VocabData[]> {
    console.log('Preloader: Force loading vocab batch...');
    const batch = await vocabPicker.pickVocabBatch();
    console.log('Preloader: Force loaded vocab batch');
    return batch;
  }

  async function forceLoadNextTask(): Promise<RuntimeTask | null> {
    console.log('Preloader: Force loading task...');
    const task = await taskPicker.pickTask();
    console.log('Preloader: Force loaded task');
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