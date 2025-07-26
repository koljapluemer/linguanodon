import { ref, computed } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { useQueuePreloader } from './useQueuePreloader';

// State machine types
export type QueueState = 
  | { status: 'initializing' }
  | { status: 'loading', message?: string }
  | { status: 'vocab', vocab: VocabData, batchIndex: number, batchSize: number }
  | { status: 'task', task: RuntimeTask }
  | { status: 'empty', message: string }
  | { status: 'error', message: string };

type PreloaderInstance = ReturnType<typeof useQueuePreloader>;

interface VocabBatchState {
  currentBatch: VocabData[];
  currentIndex: number;
}

export function useQueueStateMachine(preloader: PreloaderInstance) {
  // Current state
  const state = ref<QueueState>({ status: 'initializing' });
  
  // Current vocab batch tracking
  const vocabBatchState = ref<VocabBatchState>({
    currentBatch: [],
    currentIndex: 0
  });

  // State transition logging
  function logTransition(from: string, to: string, reason: string) {
    console.log(`StateMachine: ${from} → ${to} (${reason})`);
  }

  // Initialize queue
  async function initialize() {
    const fromStatus = state.value.status;
    state.value = { status: 'loading', message: 'Loading your learning queue...' };
    logTransition(fromStatus, 'loading', 'initialization started');
    
    try {
      await preloader.initialize();
      
      // Try to start with vocab
      const nextState = await tryTransitionToVocab('initialization complete');
      if (!nextState) {
        // Fall back to task if no vocab available
        const taskTransition = await tryTransitionToTask('no vocab available');
        if (!taskTransition) {
          // No content available
          state.value = { 
            status: 'empty', 
            message: 'No vocabulary or tasks are currently available for practice.' 
          };
          logTransition('loading', 'empty', 'no content available');
        }
      }
    } catch (error) {
      console.error('StateMachine: Initialization failed:', error);
      state.value = { 
        status: 'error', 
        message: 'Failed to initialize learning queue. Please try again.' 
      };
      logTransition(fromStatus, 'error', 'initialization failed');
    }
  }

  // Try to transition to vocab (returns true if successful)
  async function tryTransitionToVocab(reason: string): Promise<boolean> {
    const fromStatus = state.value.status;
    
    // Check if we have vocab in current batch
    if (vocabBatchState.value.currentIndex < vocabBatchState.value.currentBatch.length) {
      const vocab = vocabBatchState.value.currentBatch[vocabBatchState.value.currentIndex];
      state.value = { 
        status: 'vocab', 
        vocab, 
        batchIndex: vocabBatchState.value.currentIndex + 1,
        batchSize: vocabBatchState.value.currentBatch.length
      };
      logTransition(fromStatus, 'vocab', `${reason} - using current batch`);
      return true;
    }

    // Need new batch - try instant consumption
    const newBatch = preloader.consumeNextVocabBatch();
    if (newBatch && newBatch.length > 0) {
      vocabBatchState.value = {
        currentBatch: newBatch,
        currentIndex: 0
      };
      
      const vocab = newBatch[0];
      state.value = { 
        status: 'vocab', 
        vocab, 
        batchIndex: 1,
        batchSize: newBatch.length
      };
      logTransition(fromStatus, 'vocab', `${reason} - new batch loaded instantly`);
      return true;
    }

    // No vocab available instantly - try force loading
    state.value = { status: 'loading', message: 'Preparing next exercise...' };
    logTransition(fromStatus, 'loading', `${reason} - force loading vocab`);
    
    try {
      const forcedBatch = await preloader.forceLoadNextVocabBatch();
      if (forcedBatch.length > 0) {
        vocabBatchState.value = {
          currentBatch: forcedBatch,
          currentIndex: 0
        };
        
        const vocab = forcedBatch[0];
        state.value = { 
          status: 'vocab', 
          vocab, 
          batchIndex: 1,
          batchSize: forcedBatch.length
        };
        logTransition('loading', 'vocab', `${reason} - force loaded vocab batch`);
        return true;
      }
    } catch (error) {
      console.error('StateMachine: Force loading vocab failed:', error);
    }

    return false;
  }

  // Try to transition to task (returns true if successful)
  async function tryTransitionToTask(reason: string): Promise<boolean> {
    const fromStatus = state.value.status;
    
    // Try instant consumption
    const task = preloader.consumeNextTask();
    if (task) {
      state.value = { status: 'task', task };
      logTransition(fromStatus, 'task', `${reason} - task loaded instantly`);
      return true;
    }

    // No task available instantly - try force loading
    state.value = { status: 'loading', message: 'Preparing next task...' };
    logTransition(fromStatus, 'loading', `${reason} - force loading task`);
    
    try {
      const forcedTask = await preloader.forceLoadNextTask();
      if (forcedTask) {
        state.value = { status: 'task', task: forcedTask };
        logTransition('loading', 'task', `${reason} - force loaded task`);
        return true;
      }
    } catch (error) {
      console.error('StateMachine: Force loading task failed:', error);
    }

    return false;
  }

  // Complete current vocab and transition
  async function completeCurrentVocab() {
    if (state.value.status !== 'vocab') {
      console.warn('StateMachine: completeCurrentVocab called but not in vocab state');
      return;
    }

    const fromStatus = state.value.status;
    
    // Move to next vocab in batch
    vocabBatchState.value.currentIndex++;
    
    // Check if more vocab in current batch
    if (vocabBatchState.value.currentIndex < vocabBatchState.value.currentBatch.length) {
      const nextVocab = vocabBatchState.value.currentBatch[vocabBatchState.value.currentIndex];
      state.value = { 
        status: 'vocab', 
        vocab: nextVocab, 
        batchIndex: vocabBatchState.value.currentIndex + 1,
        batchSize: vocabBatchState.value.currentBatch.length
      };
      logTransition(fromStatus, 'vocab', 'next vocab in batch');
      return;
    }

    // Batch completed - try to show task
    const taskTransition = await tryTransitionToTask('vocab batch completed');
    if (taskTransition) {
      return;
    }

    // No task available - try to get next vocab batch
    const vocabTransition = await tryTransitionToVocab('no task available after vocab batch');
    if (!vocabTransition) {
      // No content available
      state.value = { 
        status: 'empty', 
        message: 'Great job! No more content is currently due for practice.' 
      };
      logTransition(fromStatus, 'empty', 'no more content available');
    }
  }

  // Complete current task and transition
  async function completeCurrentTask() {
    if (state.value.status !== 'task') {
      console.warn('StateMachine: completeCurrentTask called but not in task state');
      return;
    }

    const fromStatus = state.value.status;
    
    // After task, always try to return to vocab
    const vocabTransition = await tryTransitionToVocab('task completed');
    if (!vocabTransition) {
      // Try another task if no vocab available
      const taskTransition = await tryTransitionToTask('no vocab after task completion');
      if (!taskTransition) {
        // No content available
        state.value = { 
          status: 'empty', 
          message: 'Excellent work! No more content is currently available.' 
        };
        logTransition(fromStatus, 'empty', 'no content after task completion');
      }
    }
  }

  // Retry on error
  async function retry() {
    await initialize();
  }

  // Computed helpers
  const isLoading = computed(() => 
    state.value.status === 'initializing' || state.value.status === 'loading'
  );
  
  const hasError = computed(() => state.value.status === 'error');
  
  const isEmpty = computed(() => state.value.status === 'empty');
  
  const currentVocab = computed(() => 
    state.value.status === 'vocab' ? state.value.vocab : null
  );
  
  const currentTask = computed(() => 
    state.value.status === 'task' ? state.value.task : null
  );

  return {
    // State
    state: state,
    
    // Actions
    initialize,
    completeCurrentVocab,
    completeCurrentTask,
    retry,
    
    // Computed helpers
    isLoading,
    hasError,
    isEmpty,
    currentVocab,
    currentTask,
    
    // Debug
    vocabBatchState,
    preloaderStatus: preloader.status
  };
}