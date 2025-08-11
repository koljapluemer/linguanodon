import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import { useQueuePreloader } from './useQueuePreloader';
import { useQueueStateMachine } from './useQueueStateMachine';

export function useCachedQueue(
  vocabRepo: VocabAndTranslationRepoContract,
  exampleRepo: ExampleRepoContract,
  goalRepo: GoalRepoContract,
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract,
  languageRepo: LanguageRepoContract
) {
  // Initialize preloader
  const preloader = useQueuePreloader(vocabRepo, exampleRepo, goalRepo, resourceRepo, taskRepo, languageRepo);
  
  // Initialize state machine with preloader
  const stateMachine = useQueueStateMachine(preloader);

  // Return the state machine interface with consistent naming for PageQueue
  return {
    // State
    state: stateMachine.state,
    
    // Current items
    currentTask: stateMachine.currentTask,
    
    // Status checks
    hasTasksAvailable: () => preloader.hasTaskReady() || stateMachine.currentTask.value !== null,
    
    // Actions (updated to use state machine)
    initializeQueue: stateMachine.initialize,
    completeCurrentTask: stateMachine.completeCurrentTask,
    
    // Computed helpers
    isLoading: stateMachine.isLoading,
    hasError: stateMachine.hasError,
    isEmpty: stateMachine.isEmpty,
    
    // Debug access
    preloaderStatus: preloader.status,
    stateMachineDebug: {
      retry: stateMachine.retry
    }
  };
}