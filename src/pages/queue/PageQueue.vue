<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, reactive } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { TaskData } from '@/entities/tasks/Task';
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
  | { status: 'task', task: TaskData, batchId: string }
  | { status: 'empty', message: string }
  | { status: 'error', message: string };

// Task batch interface
interface TaskBatch {
  id: string;
  tasks: TaskData[];
}

// Preloader config
const PRELOAD_CONFIG = {
  minTaskBatchBuffer: 2,
  aggressiveThreshold: 1
};

// State
const state = ref<QueueState>({ status: 'initializing' });

// UI state for smooth transitions
const showLoadingUI = ref(false);
let loadingTimeout: NodeJS.Timeout | null = null;

// Preloaded content
const taskBatches = reactive<TaskBatch[]>([]);
const preloadStatus = reactive({
  taskBatchesReady: 0,
  isLoadingBatch: false,
  lastError: null as string | null
});

let batchLoadingPromise: Promise<void> | null = null;

// Loading UI helpers
function startDelayedLoading() {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }
  loadingTimeout = setTimeout(() => {
    showLoadingUI.value = true;
  }, 500);
}

function clearDelayedLoading() {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  showLoadingUI.value = false;
}

// Generate a lesson batch
async function loadTaskBatch() {
  if (preloadStatus.isLoadingBatch || batchLoadingPromise) return;

  preloadStatus.isLoadingBatch = true;
  preloadStatus.lastError = null;

  try {
    batchLoadingPromise = (async () => {
      const lesson = await makeLesson(vocabRepo!, resourceRepo!, taskRepo!, languageRepo!, immersionContentRepo!, goalRepo!);

      if (lesson.length === 0) {
        console.warn('Generated lesson is empty');
        preloadStatus.lastError = 'No tasks generated for lesson';
        return;
      }

      const shuffledLesson = shuffleArray(lesson);
      const batchId = crypto.randomUUID();
      taskBatches.push({
        id: batchId,
        tasks: shuffledLesson
      });
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
function consumeNextTask(): { task: TaskData; batchId: string } | null {
  for (let i = 0; i < taskBatches.length; i++) {
    const batch = taskBatches[i];
    if (batch.tasks.length > 0) {
      const task = batch.tasks.shift();

      if (batch.tasks.length === 0) {
        taskBatches.splice(i, 1);
        preloadStatus.taskBatchesReady = taskBatches.length;

        if (taskBatches.length <= PRELOAD_CONFIG.aggressiveThreshold) {
          loadTaskBatch();
        }
      }

      return task ? { task, batchId: batch.id } : null;
    }
  }
  return null;
}

// Force load next task
async function forceLoadNextTask(): Promise<{ task: TaskData; batchId: string } | null> {
  try {
    const lesson = await makeLesson(vocabRepo!, resourceRepo!, taskRepo!, languageRepo!, immersionContentRepo!, goalRepo!);
    const shuffledLesson = shuffleArray(lesson);
    if (shuffledLesson.length > 0) {
      const batchId = crypto.randomUUID();
      return { task: shuffledLesson[0], batchId };
    }
    return null;
  } catch (error) {
    console.error('Error force loading task:', error);
    return null;
  }
}

// Try to transition to task state
async function tryTransitionToTask(): Promise<boolean> {

  const taskWithBatch = consumeNextTask();
  if (taskWithBatch) {
    clearDelayedLoading();
    state.value = { status: 'task', task: taskWithBatch.task, batchId: taskWithBatch.batchId };
    return true;
  }

  state.value = { status: 'loading', message: 'Preparing next task...' };
  startDelayedLoading();

  try {
    const forcedTaskWithBatch = await Promise.race([
      forceLoadNextTask(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Force load timeout')), 5000)
      )
    ]);
    if (forcedTaskWithBatch) {
      clearDelayedLoading();
      state.value = { status: 'task', task: forcedTaskWithBatch.task, batchId: forcedTaskWithBatch.batchId };
      return true;
    }
  } catch (error) {
    console.error('Force loading task failed:', error);
    clearDelayedLoading();
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
  showLoadingUI.value = true; // Show loading immediately for initial load

  try {
    await initializePreloader();

    const success = await tryTransitionToTask();
    if (!success) {
      clearDelayedLoading();
      state.value = {
        status: 'empty',
        message: 'No tasks are currently available for practice.'
      };
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    clearDelayedLoading();
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

onUnmounted(() => {
  clearDelayedLoading();
});

/**
 * Handle task completion
 */
const handleTaskFinished = async () => {
  await completeCurrentTask();
};
</script>

<template>
  <!-- Loading State (only show when showLoadingUI is true or initializing) -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="state.status === 'initializing' || showLoadingUI" class="flex justify-center items-center min-h-96">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-4 text-lg">
          {{ state.status === 'loading' && state.message ? state.message : 'Loading your learning queue...' }}
        </p>
      </div>
    </div>
  </Transition>

  <!-- Error State -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="state.status === 'error'" class="alert alert-error">
      <span>{{ state.message }}</span>
      <button class="btn btn-sm" @click="retry">
        Retry
      </button>
    </div>
  </Transition>

  <!-- No Content Available -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="state.status === 'empty'" class="hero min-h-96">
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
  </Transition>


  <!-- Task -->
  <div v-if="state.status === 'task' && !showLoadingUI">
    <Transition mode="out-in" enter-active-class="transition-opacity duration-[50ms] ease-out"
      leave-active-class="transition-opacity duration-[50ms] ease-in" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <TaskRenderer :key="`${state.task.uid}-${state.batchId}`" :task="state.task" @finished="handleTaskFinished" />
    </Transition>
  </div>

  <!-- Fallback (should never happen with state machine) -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="!['initializing', 'loading', 'task', 'empty', 'error'].includes(state.status)"
      class="alert alert-warning">
      <span>Unknown queue state. Please refresh.</span>
      <button class="btn btn-sm" @click="initializeQueue">
        Refresh
      </button>
    </div>
  </Transition>
</template>