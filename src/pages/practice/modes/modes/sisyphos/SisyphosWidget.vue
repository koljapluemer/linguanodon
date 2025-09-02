<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { Task } from '@/entities/tasks/Task';
import TaskRenderer from '@/pages/practice/tasks/ui/TaskRenderer.vue';
import { useTimeTracking } from '@/shared/useTimeTracking';
import { useQueueState } from '@/pages/practice/modes/utils/useQueueState';
import { generateSisyphosTask } from './generateSisyphosTask';

// Inject repositories
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const translationRepo = inject<TranslationRepoContract>('translationRepo');
const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
const languageRepo = inject<LanguageRepoContract>('languageRepo');

if (!vocabRepo || !translationRepo || !factCardRepo || !languageRepo) {
  throw new Error('Required repositories not available');
}

// Queue state
const {
  state,
  showLoadingUI,
  startDelayedLoading,
  clearDelayedLoading,
  setLoading,
  setTask,
  setEmpty,
  setError,
  cleanup
} = useQueueState();

const lastUsedContentUid = ref<string | null>(null);

// Generate a single Sisyphos task (seen/due content only)
async function generateNextTask(): Promise<Task | null> {
  try {
    const languages = await languageRepo!.getActiveTargetLanguages();
    const languageCodes = languages.map(lang => lang.code);
    
    if (languageCodes.length === 0) {
      return null;
    }
    
    // Create block list with last used content
    const blockList = lastUsedContentUid.value ? [lastUsedContentUid.value] : undefined;
    
    return await generateSisyphosTask(
      vocabRepo!,
      translationRepo!,
      factCardRepo!,
      languageCodes,
      blockList
    );
  } catch (error) {
    console.error('Error generating Sisyphos task:', error);
    return null;
  }
}

// Try to transition to task state
async function tryTransitionToTask(): Promise<boolean> {
  setLoading('Rolling the boulder...');
  startDelayedLoading();

  try {
    const currentTask = await generateNextTask();
    
    if (currentTask) {
      // Generate next task for preloading
      const nextTask = await generateNextTask();
      
      clearDelayedLoading();
      setTask(currentTask, nextTask);
      return true;
    }
  } catch (error) {
    console.error('Task generation failed:', error);
  }
  
  clearDelayedLoading();
  setEmpty('The boulder has reached the top! No more reviews available.');
  return false;
}

// Initialize queue
async function initializeQueue() {
  setLoading('Preparing your eternal review session...');
  showLoadingUI.value = true; // Show loading immediately for initial load

  try {
    const success = await tryTransitionToTask();
    if (!success) {
      clearDelayedLoading();
      setEmpty('No reviews are currently due.');
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    clearDelayedLoading();
    setError('Failed to initialize review session. Please try again.');
  }
}

// Complete current task
async function completeCurrentTask() {
  if (state.value.status !== 'task') {
    console.warn('completeCurrentTask called but not in task state');
    return;
  }

  const currentState = state.value;
  
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
      setEmpty('Excellent work! The boulder has reached the peak once more.');
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
  cleanup();
});

// Handle task completion
const handleTaskFinished = async () => {
  // Track the content UID before completing the task
  if (state.value.status === 'task') {
    const currentTask = state.value.currentTask;
    const vocabUid = currentTask.associatedVocab?.[0];
    const factCardUid = currentTask.associatedFactCards?.[0];
    const contentUid = vocabUid || factCardUid;
    
    if (contentUid) {
      lastUsedContentUid.value = contentUid;
    }
  }
  
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
          {{ state.status === 'loading' && state.message ? state.message : 'Preparing your eternal review session...' }}
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
          <h1 class="text-5xl font-bold">🗿</h1>
          <h2 class="text-3xl font-bold mb-4">Boulder at Rest</h2>
          <p class="py-6">{{ state.message }}</p>
          <button class="btn btn-primary" @click="initializeQueue">
            Roll Again
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

  <!-- Fallback (should never happen with state machine) -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="!['initializing', 'loading', 'task', 'empty', 'error'].includes(state.status)"
      class="alert alert-warning">
      <span>The boulder has rolled off course. Please refresh.</span>
      <button class="btn btn-sm" @click="initializeQueue">
        Reset Boulder
      </button>
    </div>
  </Transition>
</template>