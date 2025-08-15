import { ref, computed } from 'vue';
import type { useQueuePreloader } from './useQueuePreloader';
import type { TaskData } from '@/entities/tasks/TaskData';

// State machine types
export type QueueState = 
  | { status: 'initializing' }
  | { status: 'loading', message?: string }
  | { status: 'task', task: TaskData }
  | { status: 'empty', message: string }
  | { status: 'error', message: string };

type PreloaderInstance = ReturnType<typeof useQueuePreloader>;

export function useQueueStateMachine(preloader: PreloaderInstance) {
  // Current state
  const state = ref<QueueState>({ status: 'initializing' });

  // State transition logging
  function logTransition(from: string, to: string, reason: string) {
    // No logging - parameters are kept to maintain call compatibility
    void from;
    void to; 
    void reason;
  }

  // Initialize queue
  async function initialize() {
    const fromStatus = state.value.status;
    state.value = { status: 'loading', message: 'Loading your learning queue...' };
    logTransition(fromStatus, 'loading', 'initialization started');
    
    try {
      await preloader.initialize();
      
      // Try to get next task
      const success = await tryTransitionToTask('initialization complete');
      if (!success) {
        // No content available
        state.value = { 
          status: 'empty', 
          message: 'No tasks are currently available for practice.' 
        };
        logTransition('loading', 'empty', 'no content available');
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


  // Complete current task and transition
  async function completeCurrentTask() {
    if (state.value.status !== 'task') {
      console.warn('StateMachine: completeCurrentTask called but not in task state');
      return;
    }

    // TaskRenderer now handles ALL entity updates and task completion logic
    // No entity processing needed here
    
    // Try to get next task
    const success = await tryTransitionToTask('task completed');
    if (!success) {
      // No more tasks available
      state.value = { 
        status: 'empty', 
        message: 'Excellent work! No more tasks are currently available.' 
      };
      logTransition('task', 'empty', 'no tasks after task completion');
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
  
  const currentTask = computed(() => 
    state.value.status === 'task' ? state.value.task : null
  );

  return {
    // State
    state: state,
    
    // Actions
    initialize,
    completeCurrentTask,
    retry,
    
    // Computed helpers
    isLoading,
    hasError,
    isEmpty,
    currentTask,
    
    // Debug
    preloaderStatus: preloader.status
  };
}