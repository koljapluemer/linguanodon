import { reactive } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import { makeLesson } from './lesson-generator/makeLesson';
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
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract,
  languageRepo: LanguageRepoContract,
  config: Partial<PreloadConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

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

  // Generate a lesson using the new lesson system
  async function loadTaskBatch() {
    if (status.isLoadingBatch || batchLoadingPromise) return;
    
    status.isLoadingBatch = true;
    status.lastError = null;
    
    try {
      batchLoadingPromise = (async () => {
        // Generate a lesson using the new lesson system
        const lesson = await makeLesson(vocabRepo, resourceRepo, taskRepo, languageRepo);
        
        if (lesson.length === 0) {
          console.warn('Generated lesson is empty');
          status.lastError = 'No tasks generated for lesson';
          return;
        }
        
        // Shuffle the lesson
        const shuffledLesson = shuffleArray(lesson);
        content.taskBatches.push(shuffledLesson);
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
    try {
      const lesson = await makeLesson(vocabRepo, resourceRepo, taskRepo, languageRepo);
      return shuffleArray(lesson);
    } catch (error) {
      console.error('Error force loading lesson:', error);
      return [];
    }
  }

  async function forceLoadNextTask(): Promise<TaskData | null> {
    // Try to get a single task from the lesson generator
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