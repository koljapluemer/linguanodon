<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { useTimeTracking } from '@/shared/useTimeTracking';
import TaskRenderer from '@/pages/practice/tasks/ui/TaskRenderer.vue';
import { generateInsertImagesTask } from './generateInsertImagesTask';

// Inject repositories
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const languageRepo = inject<LanguageRepoContract>('languageRepo');

if (!vocabRepo || !languageRepo) {
  throw new Error('Required repositories not available');
}

// Queue state types
type QueueState =
  | { status: 'initializing' }
  | { status: 'loading', message?: string }
  | { status: 'task', currentTask: Task, nextTask: Task | null }
  | { status: 'empty', message: string }
  | { status: 'error', message: string };

// State
const state = ref<QueueState>({ status: 'initializing' });
const lastUsedVocabUid = ref<string | null>(null);

// UI state for smooth transitions
const showLoadingUI = ref(false);
let loadingTimeout: NodeJS.Timeout | null = null;

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

// Generate next task
async function generateNextTask(): Promise<Task | null> {
  try {
    const languages = await languageRepo!.getActiveTargetLanguages();
    const languageCodes = languages.map(lang => lang.code);
    
    if (languageCodes.length === 0) {
      return null;
    }
    
    // Create block list with last used vocab
    const blockList = lastUsedVocabUid.value ? [lastUsedVocabUid.value] : undefined;
    
    return await generateInsertImagesTask(vocabRepo!, languageCodes, blockList);
  } catch (error) {
    console.error('Error generating next task:', error);
    return null;
  }
}

// Try to transition to task state
async function tryTransitionToTask(): Promise<boolean> {
  state.value = { status: 'loading', message: 'Finding vocabulary that needs images...' };
  startDelayedLoading();

  try {
    const currentTask = await generateNextTask();
    
    if (currentTask) {
      // Generate next task for preloading
      const nextTask = await generateNextTask();
      
      clearDelayedLoading();
      state.value = { 
        status: 'task', 
        currentTask, 
        nextTask 
      };
      return true;
    }
  } catch (error) {
    console.error('Task generation failed:', error);
  }
  
  clearDelayedLoading();
  state.value = {
    status: 'empty',
    message: 'Great work! All your vocabulary has images or has been marked as non-picturable.'
  };
  return false;
}

// Initialize queue
async function initializeQueue() {
  state.value = { status: 'loading', message: 'Preparing image insertion session...' };
  showLoadingUI.value = true; // Show loading immediately for initial load

  try {
    const success = await tryTransitionToTask();
    if (!success) {
      clearDelayedLoading();
      state.value = {
        status: 'empty',
        message: 'No vocabulary needs images right now. Check back later!'
      };
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    clearDelayedLoading();
    state.value = {
      status: 'error',
      message: 'Failed to initialize image insertion session. Please try again.'
    };
  }
}

// Complete current task
async function completeCurrentTask() {
  if (state.value.status !== 'task') {
    console.warn('completeCurrentTask called but not in task state');
    return;
  }

  const currentState = state.value;
  
  // Track the completed task's vocab UID
  const vocabUid = currentState.currentTask.associatedVocab?.[0];
  if (vocabUid) {
    lastUsedVocabUid.value = vocabUid;
  }
  
  // If we have a next task ready, use it
  if (currentState.nextTask) {
    // Show the preloaded next task
    state.value = {
      status: 'task',
      currentTask: currentState.nextTask,
      nextTask: null
    };
    
    // Generate new next task for preloading
    try {
      const newNextTask = await generateNextTask();
      if (newNextTask && state.value.status === 'task') {
        state.value.nextTask = newNextTask;
      }
    } catch (error) {
      console.error('Error generating next task:', error);
    }
  } else {
    // No next task ready, need to generate one
    const success = await tryTransitionToTask();
    if (!success) {
      state.value = {
        status: 'empty',
        message: 'Excellent work! All vocabulary has been processed.'
      };
    }
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

// Handle task completion
const handleTaskFinished = async () => {
  await completeCurrentTask();
};
</script>

<template>
  <!-- Loading State -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="state.status === 'initializing' || showLoadingUI" class="flex justify-center items-center min-h-96">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-4 text-lg">
          {{ state.status === 'loading' && state.message ? state.message : 'Preparing image insertion session...' }}
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
        Try Again
      </button>
    </div>
  </Transition>

  <!-- No Content Available -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="state.status === 'empty'" class="hero min-h-96">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">🖼️</h1>
          <h2 class="text-3xl font-bold mb-4">All Done!</h2>
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
      <TaskRenderer :key="state.currentTask.uid" :task="state.currentTask" @finished="handleTaskFinished" />
    </Transition>
  </div>

  <!-- Fallback -->
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