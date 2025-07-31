import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import { useQueuePreloader } from './useQueuePreloader';
import { useQueueStateMachine } from './useQueueStateMachine';

export function useCachedQueue(
  vocabRepo: VocabAndTranslationRepoContract,
  immersionRepo: ImmersionContentRepoContract,
  exampleRepo: ExampleRepoContract,
  goalRepo: GoalRepoContract,
  resourceRepo: ResourceRepoContract
) {
  // Initialize preloader
  const preloader = useQueuePreloader(vocabRepo, immersionRepo, exampleRepo, goalRepo, resourceRepo);
  
  // Initialize state machine with preloader
  const stateMachine = useQueueStateMachine(preloader);

  // Return the state machine interface with consistent naming for PageQueue
  return {
    // State
    state: stateMachine.state,
    
    // Current items (compatibility with existing PageQueue)
    currentVocab: stateMachine.currentVocab,
    currentTask: stateMachine.currentTask,
    
    // Status checks (compatibility with existing PageQueue)
    hasVocabAvailable: () => preloader.hasVocabReady() || stateMachine.currentVocab.value !== null,
    hasTasksAvailable: () => preloader.hasTaskReady() || stateMachine.currentTask.value !== null,
    
    // Actions (updated to use state machine)
    initializeQueue: stateMachine.initialize,
    completeCurrentVocab: stateMachine.completeCurrentVocab,
    completeCurrentTask: stateMachine.completeCurrentTask,
    
    // Computed helpers
    isLoading: stateMachine.isLoading,
    hasError: stateMachine.hasError,
    isEmpty: stateMachine.isEmpty,
    
    // Debug access
    preloaderStatus: preloader.status,
    stateMachineDebug: {
      vocabBatchState: stateMachine.vocabBatchState,
      retry: stateMachine.retry
    }
  };
}