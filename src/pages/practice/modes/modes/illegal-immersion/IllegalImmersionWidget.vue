<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, computed } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import TaskRenderer from '@/pages/practice/tasks/ui/TaskRenderer.vue';
import { useTimeTracking } from '@/shared/useTimeTracking';
import { useQueueState } from '@/pages/practice/modes/utils/useQueueState';
import { generateIllegalImmersionTask, getIllegalImmersionProgress } from './generateIllegalImmersionTasks';

// Inject repositories
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const translationRepo = inject<TranslationRepoContract>('translationRepo');
const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
const languageRepo = inject<LanguageRepoContract>('languageRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const noteRepo = inject<NoteRepoContract>('noteRepo');

if (!vocabRepo || !translationRepo || !factCardRepo || !languageRepo || !resourceRepo || !noteRepo) {
  throw new Error('Required repositories not available');
}

// Create repositories object for TaskRenderer
const repositories = computed<RepositoriesContext>(() => ({
  vocabRepo,
  translationRepo,
  factCardRepo,
  languageRepo,
  resourceRepo,
  noteRepo
}));

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

// Progress tracking
const progressInfo = ref({
  currentPhase: 'initial-round' as 'initial-round' | 'due-round' | 'consume-content',
  totalEstimatedTasks: 0,
  completedTasks: 0,
  progressPercentage: 0,
  phaseDescription: ''
});

// Update progress info
function updateProgress() {
  progressInfo.value = getIllegalImmersionProgress();
}

// Generate next illegal immersion task
async function generateNextTask(): Promise<Task | null> {
  try {
    const languages = await languageRepo!.getActiveTargetLanguages();
    const languageCodes = languages.map(lang => lang.code);
    
    if (languageCodes.length === 0) {
      return null;
    }
    
    // Create block list with last used content
    const blockList = lastUsedContentUid.value ? [lastUsedContentUid.value] : undefined;
    
    return await generateIllegalImmersionTask(
      vocabRepo!,
      translationRepo!,
      factCardRepo!,
      resourceRepo!,
      languageCodes,
      blockList
    );
  } catch (error) {
    console.error('Error generating illegal immersion task:', error);
    return null;
  }
}

// Try to transition to task state
async function tryTransitionToTask(): Promise<boolean> {
  setLoading('Preparing immersion session...');
  startDelayedLoading();

  try {
    const currentTask = await generateNextTask();
    
    if (currentTask) {
      // Generate next task for preloading
      const nextTask = await generateNextTask();
      
      // Update progress after generating tasks
      updateProgress();
      
      clearDelayedLoading();
      setTask(currentTask, nextTask);
      return true;
    }
  } catch (error) {
    console.error('Task generation failed:', error);
  }
  
  clearDelayedLoading();
  setEmpty('No immersion content available. Add some immersion resources to get started!');
  return false;
}

// Initialize queue
async function initializeQueue() {
  setLoading('Starting illegal immersion mode...');
  showLoadingUI.value = true; // Show loading immediately for initial load

  try {
    const success = await tryTransitionToTask();
    if (!success) {
      clearDelayedLoading();
      setEmpty('No immersion content is currently available for practice.');
    } else {
      // Initialize progress tracking
      updateProgress();
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    clearDelayedLoading();
    setError('Failed to initialize illegal immersion session. Please try again.');
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
      
      // Update progress after task completion
      updateProgress();
    } catch (error) {
      console.error('Error generating next task:', error);
    }
  } else {
    // No next task ready, need to generate one
    const success = await tryTransitionToTask();
    if (!success) {
      setEmpty('Immersion session complete! No more content available.');
    } else {
      // Update progress after task transition
      updateProgress();
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
    const resourceUid = currentTask.associatedResources?.[0];
    const contentUid = vocabUid || factCardUid || resourceUid;
    
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
          {{ state.status === 'loading' && state.message ? state.message : 'Starting illegal immersion...' }}
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
          <h1>🚫📚</h1>
          <h2>Immersion Complete</h2>
          <p class="py-6">{{ state.message }}</p>
          <button class="btn btn-primary" @click="initializeQueue">
            Check for More Content
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Progress Bar -->
  <div v-if="state.status === 'task' && !showLoadingUI && progressInfo.totalEstimatedTasks > 0" class="mb-6">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-light">{{ progressInfo.phaseDescription }}</span>
      <span class="text-sm font-medium text-light">
        {{ progressInfo.completedTasks }}/{{ progressInfo.totalEstimatedTasks }}
      </span>
    </div>
    <div class="w-full bg-base-300 rounded-full h-2.5">
      <div 
        class="bg-primary h-2.5 rounded-full transition-all duration-300"
        :style="{ width: progressInfo.progressPercentage + '%' }"
      ></div>
    </div>
    <div class="flex items-center justify-between mt-1">
      <span class="text-xs text-base-content/50">
        {{ Math.round(progressInfo.progressPercentage) }}% complete
      </span>
      <span class="text-xs text-base-content/50 capitalize">
        {{ progressInfo.currentPhase.replace('-', ' ') }}
      </span>
    </div>
  </div>

  <!-- Task -->
  <div v-if="state.status === 'task' && !showLoadingUI">
    <Transition mode="out-in" enter-active-class="transition-opacity duration-[50ms] ease-out"
      leave-active-class="transition-opacity duration-[50ms] ease-in" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <TaskRenderer 
        :key="state.currentTask.uid" 
        :task="state.currentTask" 
        :repositories="repositories" 
        :mode-context="{ setWrongVocabDueAgainImmediately: true }"
        @finished="handleTaskFinished" 
      />
    </Transition>
  </div>

  <!-- Fallback (should never happen with state machine) -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="!['initializing', 'loading', 'task', 'empty', 'error'].includes(state.status)"
      class="alert alert-warning">
      <span>The immersion session has gone astray. Please refresh.</span>
      <button class="btn btn-sm" @click="initializeQueue">
        Reset Session
      </button>
    </div>
  </Transition>
</template>
