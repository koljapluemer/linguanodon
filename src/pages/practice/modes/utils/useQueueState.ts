import { ref } from 'vue';
import type { Task } from '@/entities/tasks/Task';

// Queue state types
export type QueueState =
  | { status: 'initializing' }
  | { status: 'loading', message?: string }
  | { status: 'task', currentTask: Task, nextTask: Task | null }
  | { status: 'empty', message: string }
  | { status: 'error', message: string };

export function useQueueState() {
  // State
  const state = ref<QueueState>({ status: 'initializing' });

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

  // State setters
  function setInitializing() {
    state.value = { status: 'initializing' };
  }

  function setLoading(message?: string) {
    state.value = { status: 'loading', message };
  }

  function setTask(currentTask: Task, nextTask: Task | null = null) {
    state.value = { status: 'task', currentTask, nextTask };
  }

  function setEmpty(message: string) {
    state.value = { status: 'empty', message };
  }

  function setError(message: string) {
    state.value = { status: 'error', message };
  }

  // Cleanup function for unmounting
  function cleanup() {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
  }

  return {
    // State
    state,
    showLoadingUI,
    
    // Loading UI helpers
    startDelayedLoading,
    clearDelayedLoading,
    
    // State setters
    setInitializing,
    setLoading,
    setTask,
    setEmpty,
    setError,
    
    // Cleanup
    cleanup
  };
}