<script setup lang="ts">
import { inject, onMounted, ref, reactive } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';
import TaskRenderer from '@/widgets/do-task/TaskRenderer.vue';
import { useTimeTracking } from '@/shared/useTimeTracking';
import { makeLesson } from './lesson-generator/makeLesson';
import { shuffleArray } from '@/shared/arrayUtils';

// Inject repositories
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const translationRepo = inject<TranslationRepoContract>('translationRepo');
const goalRepo = inject<GoalRepoContract>('goalRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo');
const languageRepo = inject<LanguageRepoContract>('languageRepo');
const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo');

if (!vocabRepo || !translationRepo || !goalRepo || !resourceRepo || !taskRepo || !languageRepo || !immersionContentRepo) {
  throw new Error('Repositories not available');
}

// Queue state types
type QueueState = 
  | { status: 'initializing' }
  | { status: 'loading', message?: string }
  | { status: 'task', task: TaskData }
  | { status: 'empty', message: string }
  | { status: 'error', message: string };

// Preloader config
const PRELOAD_CONFIG = {
  minTaskBatchBuffer: 2,
  aggressiveThreshold: 1
};

// State
const state = ref<QueueState>({ status: 'initializing' });

// Preloaded content
const taskBatches = reactive<TaskData[][]>([]);
const preloadStatus = reactive({
  taskBatchesReady: 0,
  isLoadingBatch: false,
  lastError: null as string | null
});

let batchLoadingPromise: Promise<void> | null = null;

// Generate a lesson batch
async function loadTaskBatch() {
  if (preloadStatus.isLoadingBatch || batchLoadingPromise) return;
  
  preloadStatus.isLoadingBatch = true;
  preloadStatus.lastError = null;
  
  try {
    batchLoadingPromise = (async () => {
      const lesson = await makeLesson(vocabRepo!, resourceRepo!, taskRepo!, languageRepo!, immersionContentRepo!);
      
      if (lesson.length === 0) {
        console.warn('Generated lesson is empty');
        preloadStatus.lastError = 'No tasks generated for lesson';
        return;
      }
      
      const shuffledLesson = shuffleArray(lesson);
      taskBatches.push(shuffledLesson);
      preloadStatus.taskBatchesReady = taskBatches.length;
    })();
    
    await batchLoadingPromise;
  } catch (error) {
    console.error('Error loading task batch:', error);
    preloadStatus.lastError = 'Failed to load task batch';
  } finally {
    preloadStatus.isLoadingBatch = false;
    batchLoadingPromise = null;
    
    // Only retry if we haven't hit an error and still need more batches
    if (taskBatches.length < PRELOAD_CONFIG.minTaskBatchBuffer && !preloadStatus.lastError) {
      setTimeout(() => loadTaskBatch(), 100);
    }
  }
}

// Initialize preloader
async function initializePreloader() {
  const promises = [];
  for (let i = 0; i < PRELOAD_CONFIG.minTaskBatchBuffer; i++) {
    promises.push(loadTaskBatch());
  }
  await Promise.all(promises);
}

// Consume next task
function consumeNextTask(): TaskData | null {
  for (let i = 0; i < taskBatches.length; i++) {
    const batch = taskBatches[i];
    if (batch.length > 0) {
      const task = batch.shift();
      
      if (batch.length === 0) {
        taskBatches.splice(i, 1);
        preloadStatus.taskBatchesReady = taskBatches.length;
        
        if (taskBatches.length <= PRELOAD_CONFIG.aggressiveThreshold) {
          loadTaskBatch();
        }
      }
      
      return task || null;
    }
  }
  return null;
}

// Force load next task
async function forceLoadNextTask(): Promise<TaskData | null> {
  try {
    const lesson = await makeLesson(vocabRepo!, resourceRepo!, taskRepo!, languageRepo!, immersionContentRepo!);
    const shuffledLesson = shuffleArray(lesson);
    return shuffledLesson.length > 0 ? shuffledLesson[0] : null;
  } catch (error) {
    console.error('Error force loading task:', error);
    return null;
  }
}

// Try to transition to task state
async function tryTransitionToTask(): Promise<boolean> {
  
  const task = consumeNextTask();
  if (task) {
    state.value = { status: 'task', task };
    return true;
  }

  state.value = { status: 'loading', message: 'Preparing next task...' };
  
  try {
    const forcedTask = await Promise.race([
      forceLoadNextTask(),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Force load timeout')), 5000)
      )
    ]);
    if (forcedTask) {
      state.value = { status: 'task', task: forcedTask };
      return true;
    }
  } catch (error) {
    console.error('Force loading task failed:', error);
    state.value = { 
      status: 'empty', 
      message: 'Unable to load more tasks. Please try refreshing.' 
    };
  }

  return false;
}

// Initialize queue
async function initializeQueue() {
  state.value = { status: 'loading', message: 'Loading your learning queue...' };
  
  try {
    await initializePreloader();
    
    const success = await tryTransitionToTask();
    if (!success) {
      state.value = { 
        status: 'empty', 
        message: 'No tasks are currently available for practice.' 
      };
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    state.value = { 
      status: 'error', 
      message: 'Failed to initialize learning queue. Please try again.' 
    };
  }
}

// Complete current task
async function completeCurrentTask() {
  if (state.value.status !== 'task') {
    console.warn('completeCurrentTask called but not in task state');
    return;
  }

  const success = await tryTransitionToTask();
  if (!success) {
    state.value = { 
      status: 'empty', 
      message: 'Excellent work! No more tasks are currently available.' 
    };
  }
}

// Retry on error
async function retry() {
  await initializeQueue();
}

// Initialize time tracking for this page
useTimeTracking();

onMounted(async () => {
  await initializeQueue();
});

/**
 * Handle task completion
 */
const handleTaskFinished = async () => {
  await completeCurrentTask();
};
</script>

<template>
  <div class="min-h-screen bg-base-200 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="state.status === 'initializing' || state.status === 'loading'" class="flex justify-center items-center min-h-96">
        <div class="text-center">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-4 text-lg">
            {{ state.status === 'loading' && state.message ? state.message : 'Loading your learning queue...' }}
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="state.status === 'error'" class="alert alert-error">
        <span>{{ state.message }}</span>
        <button class="btn btn-sm" @click="retry">
          Retry
        </button>
      </div>

      <!-- No Content Available -->
      <div v-else-if="state.status === 'empty'" class="hero min-h-96">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">All Done!</h1>
            <p class="py-6">{{ state.message }}</p>
            <button class="btn btn-primary" @click="initializeQueue">
              Check Again
            </button>
          </div>
        </div>
      </div>


      <!-- Task -->
      <div v-else-if="state.status === 'task'">
        <TaskRenderer 
          :key="state.task.uid"
          :task="state.task"
          @finished="handleTaskFinished"
        />
      </div>

      <!-- Fallback (should never happen with state machine) -->
      <div v-else class="alert alert-warning">
        <span>Unknown queue state. Please refresh.</span>
        <button class="btn btn-sm" @click="initializeQueue">
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>